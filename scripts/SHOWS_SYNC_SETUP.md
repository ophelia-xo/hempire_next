# Auto-syncing shows from the calendar

This repo has a GitHub Action that reads your Google Calendar once a day, updates
`data/shows.ts`, and pushes the change — which triggers a Vercel deploy. Fully
hands-off once set up. To add/change/remove a show, just edit the calendar event.

- Script: `scripts/sync-shows.mjs`
- Workflow: `.github/workflows/sync-shows.yml` (daily at 12:00 UTC + manual "Run workflow")

It reads the calendar through its **secret iCal link** — a private URL that
returns the events. No Google Cloud project or service account required.

## One-time setup (~5 min)

### 1. Get the calendar's secret iCal URL

1. Open [Google Calendar](https://calendar.google.com/) on the account that has
   the shows (your personal calendar).
2. Left sidebar → hover your calendar → ⋮ → **Settings and sharing**.
3. Scroll to **Integrate calendar** → copy the **Secret address in iCal format**.
   It ends in `.ics`. Treat it like a password — anyone with it can read the calendar.

> Using a dedicated band calendar instead? Same steps, on that calendar. If it's
> shared to you but you're not the owner, only the owner can see its *secret*
> address — have them copy it to you (or just use your personal calendar).

### 2. Add GitHub secrets

In the repo on GitHub: **Settings → Secrets and variables → Actions → New repository secret**.
Add these three:

| Secret name | Value |
|---|---|
| `ICS_URL` | The secret iCal URL from step 1.3 |
| `SHOW_ORGANIZER_EMAILS` | The address(es) that **create the show invites** — i.e. whoever adds you to the events (e.g. `hempirerocks@gmail.com`). Only events organized by these become shows; the rest of your calendar is ignored. Comma-separate multiple. |
| `ANTHROPIC_API_KEY` | An Anthropic API key ([console.anthropic.com](https://console.anthropic.com/) → API keys). Enables smart parsing of messy event text (~a fraction of a cent per run). |

> **Finding the right organizer email:** open one of your show events in Google
> Calendar and look at who invited you — that address goes in `SHOW_ORGANIZER_EMAILS`.
> If shows come from more than one person, list them all comma-separated.
>
> **Optional extra filtering:** placeholder events are already dropped by title
> (see below). To drop more, add a `SHOW_EXCLUDE_TITLES` secret with extra
> comma-separated keywords.

### 3. Test it

1. Repo → **Actions** tab → "Sync shows from calendar" → **Run workflow**.
2. Watch the run. If green, check `data/shows.ts` — it should reflect your calendar.
3. Vercel picks up the push and redeploys automatically.

## How events map to the site

First, events are **filtered** down to real, confirmed shows. An event is dropped if:

- it's **not** organized by an address in `SHOW_ORGANIZER_EMAILS` (keeps your
  personal events off the site), or
- its title looks like a placeholder — contains `hold`, `block`, `unavailab`,
  `tentative`, `pencil`, `tba`, or `tbd` (case-insensitive), so a "block for
  tour" or "hold for …" never goes live, or
- it's cancelled, declined, or in the past.

With smart parsing on, Claude does a second pass and skips anything that still
looks tentative rather than a booked gig.

Each surviving event becomes one show:

- **Event date** → `date`
- **Event title** → `venue` (the place name)
- **Event location** → `city` ("City, ST")
- **Event description** → `note` (short extra, e.g. "with The Doomed") and any
  ticket link → `ticketUrl`. No link = shown as "Free".

Tips for clean results:
- Put the **venue name in the event title**, the **city/address in the location** field.
- Paste the **ticket URL** into the description. Leave it out for free / door shows.
- Events with no usable venue or city are skipped (so nothing half-formed goes live).

## Changing the schedule

Edit the `cron` line in `.github/workflows/sync-shows.yml`. It's UTC.
`0 12 * * *` = daily at 12:00 UTC. `0 */6 * * *` = every 6 hours.

> Note: Google's secret iCal feed can lag real edits by up to a few hours, so a
> daily (or even hourly) sync is plenty — the feed itself is the slow part, not
> the Action.

## Running locally (optional)

```bash
export ICS_URL="https://calendar.google.com/calendar/ical/.../basic.ics"
export SHOW_ORGANIZER_EMAILS="hempirerocks@gmail.com"
export ANTHROPIC_API_KEY="sk-ant-..."   # optional
npm install --no-save @anthropic-ai/sdk
DRY_RUN=1 node scripts/sync-shows.mjs    # prints result, writes nothing
```
