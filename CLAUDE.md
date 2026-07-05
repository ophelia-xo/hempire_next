# Hempire — hempirerocks.com

Band site for Hempire (Asheville, NC). Next.js App Router + Tailwind v4, fully static, deployed to prod on push to `main` (Vercel).

## Content rules — read this first

**The client is strict: no AI-generated content, ever.** Every word of copy on this site must come from something the band wrote themselves. Do not write, paraphrase, "clean up", or remix band copy — not even lightly. If new copy is needed and no band-written source covers it, stop and ask Olive; never fill the gap yourself.

Approved sources, in order of preference:

1. **The band's Spotify bio** — the current bio in `data/site.ts` is both paragraphs of it, verbatim (including the THE WEIGHT paragraph). Curly apostrophes and the `-` dashes are intentional; they match the source.
2. **Their EPK** ("Hempire EPK 2025.pdf", lives on Olive's Desktop) — member credits ("Vox, Guitar"), booking line wording ("All booking inquiries:"). Note the EPK is out of date; treat its facts (shows, news, PR contact) as stale.
3. **Their Bandcamp / merch listings** — product names and prices in `data/merch.ts`.

What's fine without a source: factual data (show dates, venues, cities, prices, member names), plain functional labels ("Shows", "Merch", "Booking Inquiries", "Tickets", "No upcoming shows"), and UI feedback text ("Copied to clipboard"). Anything with a voice needs a band source.

Wording the client has explicitly rejected — do not reintroduce: "Hash Thrash" / "High Country Hash Thrash" as visible copy (it survives only in one merch photo alt because the shirt itself says it), Genre/FFO lines, taglines like "Turn it up" or "Wear It Loud", and any AI-flavored section blurbs.

## Design direction

The client rejected an earlier rich "cinematic" design as looking AI-generated. The direction is **DIY press kit / blog post**, modeled loosely on howlinggiant.com — but keep the code and UX at professional quality. Principles, in the client's priority order:

- **Less.** Fewer sections, fewer images, fewer words. When in doubt, cut. The only images on the site are the wordmark and merch product photos — no band/stage photography.
- **Blog-post layout.** One narrow reading column (`max-w-3xl`), text-first, hairline rules between sections, left-aligned. The "hero" is a masthead: wordmark, "Asheville, NC", the bio, the members, the booking email.
- **DIY and grungy, not showy.** Dark ink background, ember-orange accent, Anton/Barlow, film grain — yes. Marquees, ghost words, parallax, spinning vinyl, hover theatrics — no (all were removed; see git history `9e4fbdd` for the old design if ever wanted again).
- **Booking contact must be plainly visible at the top** (inline in the masthead, click-to-copy) and repeated at the bottom. No contact form — it was considered and rejected (needs a third-party service; copy-email never breaks).

## Feature flags

`data/site.ts` → `features`. Sections/components are kept in the codebase and toggled, not deleted:

- `music` (off) — The Weight section: cover, tracklist, Bandcamp player
- `merch` (on) — merch grid
- `builtByCredit` (off) — "Built by bash squad" footer link; client doesn't want it shown

Nav links derive from these flags automatically; don't hardcode section links.

## Where things live

- All copy and links: `data/site.ts` (bio, email, socials, flags, nav), `data/members.ts`, `data/merch.ts`, `data/album.ts`
- `data/shows.ts` is written by a scheduled sync task — don't hand-edit it casually (see `scripts/`)
- Sections are one component each in `components/`; shared bits in `components/ui/`

## Gotchas

- Running `npm run build` while `npm run dev` is running corrupts `.next` and the dev server starts 500ing (`MODULE_NOT_FOUND` in `_document.js`). Fix: kill dev, `rm -rf .next`, restart dev.
- The scroll reveals are gated behind `prefers-reduced-motion` and scripting media queries in `globals.css` — content is never hidden for no-JS or reduced-motion visitors. Keep that gate if touching motion.
- Verify changes with the real page (`curl` the dev server or a browser), not just `tsc`/lint.
