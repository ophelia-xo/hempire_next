#!/usr/bin/env node
/**
 * sync-shows.mjs
 *
 * Deterministic half of the shows sync. A scheduled Claude task (see
 * scripts/SHOWS_SYNC_SETUP.md) drives it in two steps:
 *
 *   node scripts/sync-shows.mjs fetch
 *     Fetches the calendar's secret iCal feed, filters to real upcoming shows
 *     (known organizer, not a hold/placeholder, not cancelled, not past), and
 *     prints JSON for the research pass:
 *       { events, skippedOtherOrganizer, signature, signatureChanged }
 *     Also records the signature in scripts/.sync-last-fetch.json so `write`
 *     can advance the change guard.
 *
 *   node scripts/sync-shows.mjs write <researched.json>
 *     Takes the researched result — { shows: [...], notes: [...] } — then
 *     validates, normalizes, renders data/shows.ts, advances the change-guard
 *     state (scripts/shows-sync-state.json), and writes the commit message to
 *     scripts/.sync-commit-msg.txt. Fails closed: bad input writes nothing,
 *     so the live site never degrades.
 *
 * The research itself (venue names, "City, ST", real ticket URLs via web
 * search) is done by the scheduled Claude task between the two steps — no
 * API key needed.
 *
 * Config: scripts/sync-config.local.json (gitignored; see
 * scripts/sync-config.example.json), overridable by env vars of the same name.
 *   ICS_URL                (required) the calendar's "Secret address in iCal format"
 *   SHOW_ORGANIZER_EMAILS  (recommended) comma-separated organizer emails whose
 *                          events are shows. Without it, every event is published.
 *   SHOW_TITLE_MATCH       (optional) also include events whose title contains this
 *                          text (case-insensitive). OR'd with SHOW_ORGANIZER_EMAILS.
 *   SHOW_EXCLUDE_TITLES    (optional) extra comma-separated title keywords to treat
 *                          as non-shows, added to the built-in list below.
 *   LOOKAHEAD_DAYS         (optional) how far ahead to look, default 365
 */

import { writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOWS_PATH = join(__dirname, "..", "data", "shows.ts");
const COMMIT_MSG_PATH = join(__dirname, ".sync-commit-msg.txt");
const STATE_PATH = join(__dirname, "shows-sync-state.json");
const LAST_FETCH_PATH = join(__dirname, ".sync-last-fetch.json");
const CONFIG_PATH = join(__dirname, "sync-config.local.json");

/** Title keywords that mark a calendar event as NOT a public show. */
const DEFAULT_EXCLUDE_TITLES = [
  "hold",
  "block",
  "unavailab", // unavailable / unavailability
  "tentative",
  "pencil",
  "tba",
  "tbd",
];

function fail(msg) {
  console.error("sync-shows: " + msg);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Config: sync-config.local.json, overridable by env vars of the same name.
// ---------------------------------------------------------------------------

async function loadConfig() {
  let file = {};
  try {
    file = JSON.parse(await readFile(CONFIG_PATH, "utf8"));
  } catch {}
  const get = (key) => {
    const v = process.env[key] ?? file[key] ?? "";
    return String(v).trim();
  };
  return {
    icsUrl: get("ICS_URL"),
    organizerEmails: get("SHOW_ORGANIZER_EMAILS"),
    titleMatch: get("SHOW_TITLE_MATCH"),
    excludeTitles: get("SHOW_EXCLUDE_TITLES"),
    lookaheadDays: Number(get("LOOKAHEAD_DAYS")) || 365,
  };
}

// ---------------------------------------------------------------------------
// iCal parsing (RFC 5545, minimal). We only need a handful of fields, and we
// deliberately read the *wall-clock* date straight out of DTSTART so a show at
// 8pm never rolls to the wrong day via timezone math.
// ---------------------------------------------------------------------------

function unfold(text) {
  // Folded lines are continued with a leading space or tab on the next line.
  return text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
}

function unescapeText(v) {
  return v
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function extractEmail(v) {
  const m = String(v).match(/mailto:([^\s;:]+)/i);
  return m ? m[1].trim().toLowerCase() : "";
}

/** Parse iCal text into a flat list of event objects. */
export function parseICS(text) {
  const lines = unfold(text).split(/\r\n|\n|\r/);
  const events = [];
  let cur = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      cur = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (cur) events.push(cur);
      cur = null;
      continue;
    }
    if (!cur) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const left = line.slice(0, idx);
    const value = line.slice(idx + 1);
    const [name, ...paramParts] = left.split(";");
    const params = {};
    for (const p of paramParts) {
      const eq = p.indexOf("=");
      if (eq !== -1) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1);
    }
    switch (name.toUpperCase()) {
      case "SUMMARY":
        cur.title = unescapeText(value);
        break;
      case "LOCATION":
        cur.location = unescapeText(value);
        break;
      case "DESCRIPTION":
        cur.description = unescapeText(value);
        break;
      case "STATUS":
        cur.status = value.toUpperCase();
        break;
      case "UID":
        cur.uid = value;
        break;
      case "DTSTART": {
        const digits = value.replace(/[^0-9]/g, "");
        if (digits.length >= 8) {
          cur.date = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
        }
        break;
      }
      case "ORGANIZER":
        cur.organizerEmail = extractEmail(value) || (params.CN || "").toLowerCase();
        break;
    }
  }
  return events;
}

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/**
 * Stable fingerprint of exactly what the research pass will see. If it matches
 * the last run's, the calendar didn't change and the task can skip research.
 */
export function eventsSignature(events) {
  const stable = events
    .map((e) => `${e.date}|${e.title}|${e.location}|${e.description}|${e.organizerEmail}`)
    .sort();
  return createHash("sha256").update(JSON.stringify(stable)).digest("hex");
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Build the show-event filter from config. Empty allow-list = allow all (warned). */
export function buildFilter(config) {
  const emails = config.organizerEmails
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const titleMatch = config.titleMatch.toLowerCase();
  const extraExclude = config.excludeTitles
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const excludeTitles = [...DEFAULT_EXCLUDE_TITLES, ...extraExclude];
  return { emails, titleMatch, excludeTitles };
}

/** True if the title contains any of the "not a show" keywords. */
export function isPlaceholderTitle(title, excludeTitles = DEFAULT_EXCLUDE_TITLES) {
  const t = title || "";
  return excludeTitles.some((kw) => new RegExp("\\b" + escapeRegExp(kw), "i").test(t));
}

/** True if the event's organizer is on the allow-list (or no allow-list is set). */
export function passesOrganizer(e, filter) {
  const { emails, titleMatch } = filter;
  if (!emails.length && !titleMatch) return true;
  const org = (e.organizerEmail || "").toLowerCase();
  if (emails.length && emails.includes(org)) return true;
  if (titleMatch && (e.title || "").toLowerCase().includes(titleMatch)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// fetch: iCal feed -> filtered events JSON on stdout
// ---------------------------------------------------------------------------

async function cmdFetch() {
  const config = await loadConfig();
  if (!config.icsUrl || /paste|example|your-/i.test(config.icsUrl)) {
    fail(
      "ICS_URL is not configured. Paste the calendar's \"Secret address in iCal " +
        "format\" into scripts/sync-config.local.json (see sync-config.example.json)."
    );
  }

  const filter = buildFilter(config);
  if (!filter.emails.length && !filter.titleMatch) {
    console.error(
      "sync-shows: WARNING — no SHOW_ORGANIZER_EMAILS/SHOW_TITLE_MATCH set; every " +
        "readable event will be published. Set a filter if this calendar also holds personal events."
    );
  }

  let res;
  try {
    res = await fetch(config.icsUrl);
  } catch (err) {
    fail("could not fetch ICS_URL: " + err.message);
  }
  if (!res.ok) fail(`ICS_URL returned HTTP ${res.status}`);
  const all = parseICS(await res.text());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toISODate(today);
  const maxStr = toISODate(new Date(today.getTime() + config.lookaheadDays * 86400000));

  const upcoming = all.filter(
    (e) => e.date && e.date >= todayStr && e.date <= maxStr && (e.status || "") !== "CANCELLED"
  );
  const nonPlaceholder = upcoming.filter((e) => !isPlaceholderTitle(e.title, filter.excludeTitles));
  const kept = nonPlaceholder.filter((e) => passesOrganizer(e, filter));

  const hasAllowList = filter.emails.length > 0 || Boolean(filter.titleMatch);
  const skippedOtherOrganizer = hasAllowList
    ? nonPlaceholder.filter((e) => !passesOrganizer(e, filter))
    : [];

  const events = kept.map((e) => ({
    title: e.title || "",
    location: e.location || "",
    description: e.description || "",
    date: e.date,
    organizerEmail: e.organizerEmail || "",
  }));

  const signature = eventsSignature(events);
  let priorState = {};
  try {
    priorState = JSON.parse(await readFile(STATE_PATH, "utf8"));
  } catch {}

  // Recorded so `write` can advance the change guard after the research pass.
  await writeFile(
    LAST_FETCH_PATH,
    JSON.stringify({ signature, fetchedAt: new Date().toISOString() }, null, 2) + "\n",
    "utf8"
  );

  console.error(
    `sync-shows: parsed ${all.length} event(s); ${events.length} kept, ` +
      `${skippedOtherOrganizer.length} skipped (other organizers)`
  );

  process.stdout.write(
    JSON.stringify(
      {
        signature,
        signatureChanged: priorState.signature !== signature,
        events,
        skippedOtherOrganizer: skippedOtherOrganizer
          .slice(0, 8)
          .map((e) => e.title)
          .filter(Boolean),
      },
      null,
      2
    ) + "\n"
  );
}

// ---------------------------------------------------------------------------
// write: researched JSON -> data/shows.ts (+ state + commit message)
// ---------------------------------------------------------------------------

/** Validate + normalize one show; drop anything unusable or explicitly skipped. */
export function normalize(shows) {
  const out = [];
  for (const s of shows) {
    if (!s || s.skip) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date || "")) continue;
    const venue = String(s.venue || "").trim();
    const city = String(s.city || "").trim();
    if (!venue || !city) continue;
    const slug = (venue + "-" + s.date)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    out.push({
      id: slug,
      date: s.date,
      venue,
      city,
      note: s.note ? String(s.note).trim() : undefined,
      ticketUrl: s.ticketUrl ? String(s.ticketUrl).trim() : null,
    });
  }
  out.sort((a, b) => a.date.localeCompare(b.date));
  return out;
}

/** Render data/shows.ts, preserving the header comment + type. */
export function render(shows) {
  const header = `/**
 * Upcoming shows.
 *
 * AUTO-GENERATED by the scheduled Claude sync task (via scripts/sync-shows.mjs)
 * from the Google Calendar iCal feed, with a web-research pass. Manual edits
 * are overwritten on the next sync — change the calendar event instead, or
 * adjust the task prompt (see scripts/SHOWS_SYNC_SETUP.md).
 * \`date\` is ISO (YYYY-MM-DD). Past shows are filtered out on the page. Set
 * \`ticketUrl\` to null for free / at-the-door shows; the card shows "Free".
 */

export type Show = {
  id: string;
  date: string; // ISO date, e.g. "2026-07-31"
  venue: string;
  city: string;
  /** Optional note, e.g. "with The Doomed" or "Festival" */
  note?: string;
  ticketUrl: string | null;
};

`;
  const esc = (v) => JSON.stringify(v);
  const blocks = shows.map((s) => {
    const lines = [
      `    id: ${esc(s.id)},`,
      `    date: ${esc(s.date)},`,
      `    venue: ${esc(s.venue)},`,
      `    city: ${esc(s.city)},`,
    ];
    if (s.note) lines.push(`    note: ${esc(s.note)},`);
    lines.push(`    ticketUrl: ${s.ticketUrl ? esc(s.ticketUrl) : "null"},`);
    return `  {\n${lines.join("\n")}\n  },`;
  });
  return `${header}export const shows: Show[] = [\n${blocks.join("\n")}\n];\n`;
}

async function cmdWrite(inputPath) {
  if (!inputPath) fail("usage: sync-shows.mjs write <researched.json>");

  let parsed;
  try {
    parsed = JSON.parse(await readFile(inputPath, "utf8"));
  } catch (err) {
    // Fail closed: never touch published data on bad input.
    fail("could not read researched JSON, wrote nothing: " + err.message);
  }
  if (!Array.isArray(parsed.shows)) fail("researched JSON has no `shows` array, wrote nothing");
  const notes = Array.isArray(parsed.notes) ? parsed.notes.map(String) : [];

  const shows = normalize(parsed.shows);
  if (parsed.shows.length && !shows.length) {
    fail("every show failed validation (bad dates / missing venue+city?), wrote nothing");
  }
  const next = render(shows);

  const commitMsg =
    "chore: sync shows from calendar" +
    (notes.length ? "\n\nNotes:\n" + notes.map((n) => `- ${n}`).join("\n") : "") +
    "\n";
  await writeFile(COMMIT_MSG_PATH, commitMsg, "utf8");

  // Advance the change guard to the signature recorded by the last `fetch`.
  try {
    const { signature } = JSON.parse(await readFile(LAST_FETCH_PATH, "utf8"));
    if (signature) {
      await writeFile(
        STATE_PATH,
        JSON.stringify({ signature, updatedAt: new Date().toISOString() }, null, 2) + "\n",
        "utf8"
      );
    }
  } catch {
    console.error("sync-shows: WARNING — no .sync-last-fetch.json; change guard not advanced");
  }

  let currentTs = "";
  try {
    currentTs = await readFile(SHOWS_PATH, "utf8");
  } catch {}
  if (currentTs.trim() === next.trim()) {
    console.error("sync-shows: no changes to shows.ts");
    return;
  }
  await writeFile(SHOWS_PATH, next, "utf8");
  console.error(`sync-shows: wrote ${shows.length} show(s) to data/shows.ts`);
}

// ---------------------------------------------------------------------------

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const [cmd, arg] = process.argv.slice(2);
  const run =
    cmd === "fetch" ? cmdFetch() : cmd === "write" ? cmdWrite(arg) : null;
  if (!run) fail("usage: sync-shows.mjs fetch | write <researched.json>");
  run.catch((err) => fail(err.stack || String(err)));
}
