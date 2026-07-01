#!/usr/bin/env node
/**
 * sync-shows.mjs
 *
 * Keeps data/shows.ts in sync with the band's booking calendar — but instead of
 * a dumb field-copy, it uses Claude *with web search* to research each show the
 * way a human would: proper public venue name, "City, ST", and the real ticket
 * URL. Your already-published shows are fed in as the source of truth, so good
 * hand-verified data is preserved and the calendar only drives changes.
 *
 * How it runs (see .github/workflows/sync-shows.yml):
 *   - On a daily cron in GitHub Actions.
 *   - Fetches the calendar's secret iCal feed over plain HTTPS (no service
 *     account, no auth) and parses it.
 *   - Pre-filters to real upcoming shows: known organizer, not a
 *     hold/block/unavailability placeholder, not cancelled, not past.
 *   - Hands those + the current data/shows.ts to Claude, which web-searches to
 *     clean up titles + find ticket links, keeps verified data, skips anything
 *     tentative, and returns a `notes` list of things you should know.
 *   - Writes data/shows.ts only if it changed; the workflow commits + pushes and
 *     Vercel auto-deploys. Notes go to the Actions run summary + commit message.
 *   - On a hard LLM failure it does NOT overwrite shows.ts (never degrades the
 *     live site) and exits non-zero so the failed run notifies you.
 *
 * Env vars:
 *   ICS_URL                (required) the calendar's "Secret address in iCal format"
 *   SHOW_ORGANIZER_EMAILS  (recommended) comma-separated organizer emails whose
 *                          events are shows. Without it, every event is published.
 *   SHOW_TITLE_MATCH       (optional) also include events whose title contains this
 *                          text (case-insensitive). OR'd with SHOW_ORGANIZER_EMAILS.
 *   SHOW_EXCLUDE_TITLES    (optional) extra comma-separated title keywords to treat
 *                          as non-shows, added to the built-in list below.
 *   ANTHROPIC_API_KEY      (required for smart parse) enables Claude + web search
 *   ANTHROPIC_MODEL        (optional) model id, default "claude-sonnet-5"
 *   LOOKAHEAD_DAYS         (optional) how far ahead to look, default 365
 *   DRY_RUN                (optional) "1" prints result, does not write files
 */

import { writeFile, readFile, appendFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOWS_PATH = join(__dirname, "..", "data", "shows.ts");
const COMMIT_MSG_PATH = join(__dirname, ".sync-commit-msg.txt");
const LOOKAHEAD_DAYS = Number(process.env.LOOKAHEAD_DAYS || 365);
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
const DRY_RUN = process.env.DRY_RUN === "1";

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

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/**
 * Fetch the iCal feed and pre-filter to the events worth handing to Claude.
 * Returns { events, skippedOtherOrganizer } where skippedOtherOrganizer is a
 * small sample of upcoming, non-placeholder events dropped only because their
 * organizer isn't allow-listed — surfaced so real shows never vanish silently.
 */
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toISODate(today);
  const maxStr = toISODate(new Date(today.getTime() + LOOKAHEAD_DAYS * 86400000));

  const upcoming = all.filter(
    (e) => e.date && e.date >= todayStr && e.date <= maxStr && (e.status || "") !== "CANCELLED"
  );
  const nonPlaceholder = upcoming.filter((e) => !isPlaceholderTitle(e.title, filter.excludeTitles));
  const kept = nonPlaceholder.filter((e) => passesOrganizer(e, filter));

  const hasAllowList = filter.emails.length > 0 || Boolean(filter.titleMatch);
  const skippedOtherOrganizer = hasAllowList
    ? nonPlaceholder.filter((e) => !passesOrganizer(e, filter))
    : [];

  console.error(
    `sync-shows: parsed ${all.length} event(s); ${kept.length} kept, ` +
      `${skippedOtherOrganizer.length} skipped (other organizers)`
  );

  return {
    events: kept.map((e) => ({
      title: e.title || "",
      location: e.location || "",
      description: e.description || "",
      date: e.date,
      organizerEmail: e.organizerEmail || "",
    })),
    skippedOtherOrganizer: skippedOtherOrganizer
      .slice(0, 8)
      .map((e) => e.title)
      .filter(Boolean),
  };
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

/** True if the event's organizer is on the allow-list (or no allow-list is set). */
export function passesOrganizer(e, filter) {
  const { emails, titleMatch } = filter;
  if (!emails.length && !titleMatch) return true;
  const org = (e.organizerEmail || "").toLowerCase();
  if (emails.length && emails.includes(org)) return true;
  if (titleMatch && (e.title || "").toLowerCase().includes(titleMatch)) return true;
  return false;
}

/**
 * Decide whether a parsed calendar event is one of the band's confirmed shows:
 * not cancelled, not a placeholder title, and organized by a known address.
 */
export function eventPasses(e, filter) {
  if ((e.status || "") === "CANCELLED") return false;
  if (isPlaceholderTitle(e.title, filter.excludeTitles)) return false;
  return passesOrganizer(e, filter);
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
    return {
      date: e.date,
      venue: e.title || parts[0] || "",
      city,
      note: undefined,
      ticketUrl: urlMatch ? urlMatch[0].replace(/[)>.,]+$/, "") : null,
    };
  });
}

/**
 * The research pass. Claude gets the current published shows (verified truth)
 * and the upcoming calendar events, and uses web search to produce a clean,
 * public-ready show list plus a `notes` array of things worth a human's eyes.
 * Returns { shows, notes }.
 */
async function parseWithClaude(events, currentShowsTs) {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = [
    "You maintain the 'upcoming shows' list for a band's public website.",
    "",
    "You are given (A) the CURRENT published shows (human-verified — treat as source",
    "of truth) and (B) upcoming events from the band's booking calendar. Produce the",
    "new published list.",
    "",
    "Use web search to:",
    "- Resolve messy calendar text into the correct public-facing VENUE name and 'City, ST'.",
    "- Find the official ticket/event URL for a show when you can verify a real one.",
    "",
    "Rules:",
    "- Output CONFIRMED public shows only. Skip holds / tentative / 'block for tour' /",
    "  'unavailability' / travel / day-off entries.",
    "- (A) is human-verified: KEEP its venue/city/ticketUrl for a matching show unless the",
    "  calendar clearly indicates a change or you verify better info. NEVER drop an existing",
    "  ticketUrl. Only spend web searches on shows that are new or missing a ticket link.",
    "- Never invent a ticket URL. If you can't verify one, use null (the card shows 'Free').",
    "- `note` = short extra ('with The Doomed', a festival name, etc.); else null.",
    "- `date` is 'YYYY-MM-DD', kept from the calendar.",
    "- Put anything a human should know in `notes`: an ambiguous venue, tickets you couldn't",
    "  find, a calendar-vs-published mismatch and which you kept, a newly added show, or a",
    "  show that dropped off the calendar.",
    "",
    "Return ONLY a JSON object, no prose, no markdown fences:",
    '{ "shows": [ {"date": "YYYY-MM-DD", "venue": "", "city": "City, ST", "note": null, "ticketUrl": null} ], "notes": [] }',
    "",
    "(A) CURRENT published shows (data/shows.ts):",
    "```ts",
    currentShowsTs || "// (none yet)",
    "```",
    "",
    "(B) Upcoming calendar events:",
    JSON.stringify(events, null, 2),
  ].join("\n");

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 10 }],
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("\n");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Claude returned no JSON object");
  const parsed = JSON.parse(text.slice(start, end + 1));
  return {
    shows: Array.isArray(parsed.shows) ? parsed.shows : [],
    notes: Array.isArray(parsed.notes) ? parsed.notes.map(String) : [],
  };
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
 * AUTO-GENERATED daily by scripts/sync-shows.mjs from the Google Calendar iCal
 * feed (with a Claude web-research pass). Manual edits are overwritten on the
 * next sync — change the calendar event instead, or adjust the script's prompt.
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

/** Surface notes: Actions run summary (rich), commit-message file, and stderr. */
async function emitNotes(notes, showCount) {
  const summary =
    `### 🎸 Shows sync\n\nPublished **${showCount}** show(s).\n\n` +
    (notes.length
      ? "**Heads up — worth a look:**\n" + notes.map((n) => `- ${n}`).join("\n") + "\n"
      : "_Everything parsed cleanly — no notes._\n");
  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      await appendFile(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
    } catch {}
  }

  const commitMsg =
    "chore: sync shows from calendar" +
    (notes.length ? "\n\nNotes:\n" + notes.map((n) => `- ${n}`).join("\n") : "") +
    "\n";
  try {
    await writeFile(COMMIT_MSG_PATH, commitMsg, "utf8");
  } catch {}

  if (notes.length) {
    console.error("sync-shows: notes —");
    for (const n of notes) console.error("  • " + n);
  }
}

async function main() {
  const { events, skippedOtherOrganizer } = await fetchEvents();

  let currentTs = "";
  try {
    currentTs = await readFile(SHOWS_PATH, "utf8");
  } catch {}

  let parsedShows;
  let notes = [];

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const res = await parseWithClaude(events, currentTs);
      parsedShows = res.shows;
      notes = res.notes;
    } catch (err) {
      // Fail closed: never overwrite good published data on a smart-parse error.
      await emitNotes(
        ["Smart parse FAILED (" + err.message + "). Left data/shows.ts unchanged."],
        0
      );
      fail("smart parse failed, left shows.ts unchanged: " + err.message);
    }
  } else {
    parsedShows = parseDeterministic(events);
    notes.push("ANTHROPIC_API_KEY not set — used the basic parser (no web research).");
  }

  // Surface real shows hidden by the organizer allow-list, so nothing vanishes silently.
  if (skippedOtherOrganizer.length) {
    notes.push(
      `${skippedOtherOrganizer.length} upcoming event(s) from other organizers were skipped ` +
        `(e.g. ${skippedOtherOrganizer.map((t) => `"${t}"`).join(", ")}). ` +
        "If any are real shows, add that booker's email to SHOW_ORGANIZER_EMAILS."
    );
  }

  const shows = normalize(parsedShows);
  const next = render(shows);

  await emitNotes(notes, shows.length);

  if (DRY_RUN) {
    console.error(`sync-shows: DRY_RUN — ${shows.length} show(s):`);
    process.stdout.write(next);
    return;
  }

  if (currentTs.trim() === next.trim()) {
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
