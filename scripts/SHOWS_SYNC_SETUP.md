# Auto-syncing shows from the calendar

A **scheduled Claude Code task** (not a GitHub Action) reads your Google Calendar
daily, updates `data/shows.ts`, and pushes the change — which triggers a Vercel
deploy. To add/change/remove a show, just edit the calendar event.

- Script (deterministic half): `scripts/sync-shows.mjs`
- Task: `hempire-shows-sync` in Claude Code's scheduled tasks
  (`~/.claude/scheduled-tasks/hempire-shows-sync/SKILL.md` holds the prompt)
- Local config: `scripts/sync-config.local.json` (gitignored — holds the secret
  calendar URL; copy from `sync-config.example.json`)

It reads the calendar through its **secret iCal link** — a private URL that
returns the events. No Google Cloud project, service account, or API key required.
Because the research pass runs inside a Claude Code session, it's covered by the
Claude subscription — there is **no separate API billing**.

Rather than blindly copying calendar text, each run does a **web-research pass**:
it looks up each show's proper venue name, city, and ticket link (the way you'd
do by hand), keeps whatever is already verified in `data/shows.ts`, skips
holds/tentatives, and reports **notes** of anything you should check — in the
run's session transcript and the commit message.

## How a run works

1. `node scripts/sync-shows.mjs fetch` — fetches the iCal feed, filters to real
   upcoming shows, prints them as JSON, and says whether the calendar changed
   since the last sync (fingerprint in `scripts/shows-sync-state.json`).
2. If unchanged, the run just health-checks the published ticket links and stops.
3. Otherwise Claude researches the events (web search: venue names, "City, ST",
   real ticket URLs), writes the result to a JSON file, and runs
   `node scripts/sync-shows.mjs write <file>` — which validates, renders
   `data/shows.ts`, and fails closed on bad input (never degrades the live site).
4. If `data/shows.ts` changed, the run commits (message from
   `scripts/.sync-commit-msg.txt`, includes the notes) and pushes. Vercel deploys.

Runs happen while the Claude Code app is open; if it was closed at the scheduled
time, the task runs on next launch. Each run is a session you can open and read.

## One-time setup (~2 min)

1. Open [Google Calendar](https://calendar.google.com/) on the account that has
   the shows → hover your calendar → ⋮ → **Settings and sharing** → scroll to
   **Integrate calendar** → copy the **Secret address in iCal format** (ends in
   `.ics`). Treat it like a password — anyone with it can read the calendar.
2. Paste it as `ICS_URL` in `scripts/sync-config.local.json`, and set
   `SHOW_ORGANIZER_EMAILS` to the address(es) that **create the show invites**
   (open a show event and look at who invited you). Only events organized by
   these become shows; the rest of your calendar is ignored. Comma-separate
   multiple.
3. Test: `node scripts/sync-shows.mjs fetch` should print your upcoming shows as
   JSON. Then either wait for the daily run or ask Claude to run the
   `hempire-shows-sync` task now.

> **Optional extra filtering:** placeholder events are already dropped by title
> (see below). To drop more, add keywords to `SHOW_EXCLUDE_TITLES` in the config.

## How events map to the site

First, events are **filtered** down to real, confirmed shows. An event is dropped if:

- it's **not** organized by an address in `SHOW_ORGANIZER_EMAILS` (keeps your
  personal events off the site), or
- its title looks like a placeholder — contains `hold`, `block`, `unavailab`,
  `tentative`, `pencil`, `tba`, or `tbd` (case-insensitive), so a "block for
  tour" or "hold for …" never goes live, or
- it's cancelled, declined, or in the past.

Then Claude researches the survivors and skips anything that still looks
tentative rather than a booked gig. Each surviving event becomes one show:

- **Event date** → `date`
- Correct public **venue name** → `venue` (e.g. "Sly Grog Lounge", not "slygrog")
- The venue's **city** → `city` ("City, ST")
- A short extra (support act, festival) → `note`
- The real **ticket/event URL** it can verify → `ticketUrl`. None found = "Free".

Because it's fed the current `data/shows.ts`, **anything you've already got right
is kept** — the calendar only drives new shows and changes. You barely need to
format the calendar events; cleaner titles/locations just mean fewer web searches.
Anything ambiguous (couldn't find tickets, venue mismatch, a new show) lands in
the **notes** in the run summary + commit message, so you know what to spot-check.

## How often it runs (and the change guard)

Daily at **9:00 AM local time**. Each run fingerprints the calendar and only does
the research pass — and only commits — when the calendar actually changed since
last time (tracked in `scripts/shows-sync-state.json`). Unchanged days are a
quick link health-check and a "nothing to do" report.

- **Run on demand:** ask Claude Code to run the `hempire-shows-sync` task.
- **Change the schedule or prompt:** ask Claude Code to update the
  `hempire-shows-sync` scheduled task.

> Note: Google's secret iCal feed can lag real edits by up to a few hours, so a
> daily sync is plenty — the feed itself is the slow part.

## Running the script by hand (optional)

```bash
node scripts/sync-shows.mjs fetch              # prints filtered events as JSON
node scripts/sync-shows.mjs write result.json  # {shows:[...],notes:[...]} -> data/shows.ts
```
