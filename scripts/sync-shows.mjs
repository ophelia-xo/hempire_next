#!/usr/bin/env node
/**
 * sync-shows.mjs
 *
 * Reads upcoming events from a Google Calendar *secret iCal feed* and rewrites
 * data/shows.ts. No Google Cloud project or service account needed — just the
 * calendar's private .ics URL.
 *
 * How it runs (see .github/workflows/sync-shows.yml):
 *   - On a daily cron in GitHub Actions.
 *   - Fetches the iCal feed over plain HTTPS and parses it.
 *   - Filters events down to real, confirmed shows (see eventPasses): keeps only
 *     events organized by a known address, drops "hold"/"block"/"unavailability"
 *     style placeholders, dropped/cancelled events, and past events.
 *   - Maps each surviving event to the `Show` type. If ANTHROPIC_API_KEY is set,
 *     Claude parses messy event text (venue vs. city vs. ticket link) and also
 *     skips anything that still looks tentative; otherwise a deterministic parse
 *     is used.
 *   - Writes data/shows.ts only if the content changed. The workflow then
 *     commits + pushes, and Vercel auto-deploys.
 *
 * Env vars:
 *   ICS_URL                (required) the calendar's "Secret address in iCal format"
 *   SHOW_ORGANIZER_EMAILS  (recommended) comma-separated organizer/creator emails
 *                          whose events are shows. REQUIRED in spirit when reading a
 *                          personal calendar — without it, every event is published.
 *   SHOW_TITLE_MATCH       (optional) also include events whose title contains this
 *                          text (case-insensitive). OR'd with SHOW_ORGANIZER_EMAILS.
 *   SHOW_EXCLUDE_TITLES    (optional) extra comma-separated title keywords to treat
 *                          as non-shows, added to the built-in list below.
 *   ANTHROPIC_API_KEY      (optional) enables LLM parsing of event text
 *   LOOKAHEAD_DAYS         (optional) how far ahead to look, default 365
 *   DRY_RUN                (optional) "1" prints result, does not write file
 */

import { writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOWS_PATH = join(__dirname, "..", "data", "shows.ts");
const LOOKAHEAD_DAYS = Number(process.env.LOOKAHEAD_DAYS || 365);

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

async function fetchEvents() {
  const url = process.env.ICS_URL;
  if (!url) fail("ICS_URL is not set");

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    fail("could not fetch ICS_URL: " + err.message);
  }
  if (!res.ok) fail(`ICS_URL returned HTTP ${res.status}`);
  const text = await res.text();
  const all = parseICS(text);

  const filter = readFilterFromEnv();
  if (!filter.emails.length && !filter.titleMatch) {
    console.error(
      "sync-shows: WARNING — no SHOW_ORGANIZER_EMAILS/SHOW_TITLE_MATCH set; every " +
        "readable event will be published. Set a filter if this calendar also holds personal events."
    );
  }

  // Only upcoming events inside the lookahead window (string compare is safe for
  // YYYY-MM-DD), that pass the show filter.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toISODate(today);
  const maxStr = toISODate(new Date(today.getTime() + LOOKAHEAD_DAYS * 86400000));

  const kept = all.filter(
    (e) =>
      e.date &&
      e.date >= todayStr &&
      e.date <= maxStr &&
      eventPasses(e, filter)
  );

  console.error(
    `sync-shows: parsed ${all.length} event(s), ${kept.length} matched the show filter`
  );

  return kept.map((e) => ({
    title: e.title || "",
    location: e.location || "",
    description: e.description || "",
    date: e.date,
  }));
}

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Read the show-event filter from env. Empty allow-list = allow all (warned). */
export function readFilterFromEnv(env = process.env) {
  const emails = (env.SHOW_ORGANIZER_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const titleMatch = (env.SHOW_TITLE_MATCH || "").trim().toLowerCase();
  const extraExclude = (env.SHOW_EXCLUDE_TITLES || "")
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

/**
 * Decide whether a parsed calendar event is one of the band's confirmed shows.
 * This is what keeps personal events *and* tentative holds off the public site:
 *   - drop cancelled events
 *   - drop "hold"/"block"/"unavailability"/tentative placeholders (by title)
 *   - keep only events organized by a known address (or matching a title keyword)
 */
export function eventPasses(e, filter) {
  if ((e.status || "") === "CANCELLED") return false;

  if (isPlaceholderTitle(e.title, filter.excludeTitles)) return false;

  const { emails, titleMatch } = filter;
  if (!emails.length && !titleMatch) return true; // no allow-list configured

  const org = (e.organizerEmail || "").toLowerCase();
  if (emails.length && emails.includes(org)) return true;
  if (titleMatch && (e.title || "").toLowerCase().includes(titleMatch)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Event text -> Show fields
// ---------------------------------------------------------------------------

/** Deterministic fallback: best-effort field extraction with no LLM. */
export function parseDeterministic(events) {
  return events.map((e) => {
    const loc = e.location || "";
    // Heuristic: "Venue, 123 St, City, ST" -> city = last two comma parts.
    const parts = loc.split(",").map((s) => s.trim()).filter(Boolean);
    let city = "";
    if (parts.length >= 2) city = parts.slice(-2).join(", ");
    else if (parts.length === 1) city = parts[0];
    const urlMatch = (e.description + " " + loc).match(/https?:\/\/\S+/);
    // Leave venue/city empty if unknown so normalize() drops unusable events
    // rather than publishing a "TBA" placeholder to the live site.
    return {
      date: e.date,
      venue: e.title || parts[0] || "",
      city,
      note: undefined,
      ticketUrl: urlMatch ? urlMatch[0].replace(/[)>.,]+$/, "") : null,
    };
  });
}

/** LLM parse: turn messy calendar events into clean Show fields. */
async function parseWithClaude(events) {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt =
    "You convert band calendar events into structured show data for a website.\n" +
    "Return ONLY a JSON array. One object per event, same order as input. Each object:\n" +
    '  { "date": "YYYY-MM-DD", "venue": string, "city": "City, ST", "note": string|null, "ticketUrl": string|null, "skip": boolean }\n' +
    "Rules:\n" +
    "- Keep `date` exactly as given.\n" +
    "- `venue` is the place name only (no address).\n" +
    "- `city` is 'City, ST' (US state abbreviation) when derivable, else best guess.\n" +
    "- `note` = a short extra like 'with The Doomed', a festival name, or a street address if that's all there is; else null.\n" +
    "- `ticketUrl` = the ticket/event link if present in the text; else null (free/at-the-door shows).\n" +
    "- Do not invent ticket URLs.\n" +
    "- `skip` = true if this is NOT a real public show — e.g. a tentative hold, a 'block for tour', a travel/day-off entry, an 'unavailability', or anything not yet a confirmed gig. Otherwise false.\n\n" +
    "Events:\n" +
    JSON.stringify(events, null, 2);

  const msg = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const jsonStart = text.indexOf("[");
  const jsonEnd = text.lastIndexOf("]");
  if (jsonStart === -1 || jsonEnd === -1) throw new Error("Claude returned no JSON array");
  return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
}

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
 * AUTO-GENERATED by scripts/sync-shows.mjs from the Google Calendar iCal feed.
 * Manual edits will be overwritten on the next sync. To change a show, edit the
 * calendar event instead. \`date\` is ISO (YYYY-MM-DD). Past shows are filtered
 * out automatically on the page. Set \`ticketUrl\` to null for free / at-the-door
 * shows and the card shows "Free" instead of a button.
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

async function main() {
  const events = await fetchEvents();

  let parsed;
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      parsed = await parseWithClaude(events);
    } catch (err) {
      console.error("sync-shows: LLM parse failed, using deterministic fallback:", err.message);
      parsed = parseDeterministic(events);
    }
  } else {
    parsed = parseDeterministic(events);
  }

  const shows = normalize(parsed);
  const next = render(shows);

  if (process.env.DRY_RUN === "1") {
    console.error(`sync-shows: DRY_RUN — ${shows.length} show(s):`);
    process.stdout.write(next);
    return;
  }

  let current = "";
  try {
    current = await readFile(SHOWS_PATH, "utf8");
  } catch {}

  if (current.trim() === next.trim()) {
    console.error("sync-shows: no changes");
    return;
  }
  await writeFile(SHOWS_PATH, next, "utf8");
  console.error(`sync-shows: wrote ${shows.length} show(s) to data/shows.ts`);
}

// Only run the network path when executed directly (not when imported for tests).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => fail(err.stack || String(err)));
}
