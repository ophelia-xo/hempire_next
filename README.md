# Hempire

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

The official website for Hempire, a rock and roll band out of Asheville, North
Carolina. A single-page site that puts the shows, the new record, and the merch
front and center, wrapped in a gritty black-and-white live-music look.

## Stack

- [Next.js 15](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS 4](https://tailwindcss.com/)
- Fonts: Anton (display) and Inter (body) via `next/font`
- [Vercel Analytics](https://vercel.com/analytics)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Updating content

All of the content lives in `/data` so nothing is buried in components. Edit a
file, save, redeploy.

| File | What it holds |
| --- | --- |
| `data/site.ts` | Band name, tagline, location, booking email, social links, nav |
| `data/shows.ts` | Upcoming shows. Past dates drop off automatically |
| `data/album.ts` | The featured record and its Bandcamp embed id |
| `data/merch.ts` | Merch grid (kept in sync with the Bandcamp store) |
| `data/members.ts` | Band members |

### Adding a show

Add an entry to `data/shows.ts`:

```ts
{
  id: "unique-slug",
  date: "2026-09-12",           // ISO date, sorts and formats itself
  venue: "The Grey Eagle",
  city: "Asheville, NC",
  note: "with a friend",        // optional
  ticketUrl: "https://...",     // null for a free / at-the-door show
}
```

Shows in the past are hidden and the soonest one is surfaced in the hero. If the
list is empty the Shows section shows a friendly "no shows yet" state.

### Bandcamp embed ids

The album player uses the numeric id from Bandcamp's `EmbeddedPlayer` URL, not
the album page id. To find it, open the album page source and look for
`EmbeddedPlayer/v=2/album=NNNNN`.

## Project structure

```
app/          layout, page, global styles, favicons
components/    section components (Hero, Shows, Music, Merch, ...) + ui/ + icons
data/         all editable content
lib/          small helpers (class names, date formatting)
public/images album art, band photos, merch shots, wordmark
```

## Accessibility

Built to be usable by everyone: semantic landmarks, a skip link, visible focus
states, keyboard-friendly navigation, alt text on imagery, and respect for
`prefers-reduced-motion`. Lighthouse: Accessibility 100, SEO 100.

## License

MIT. See [LICENSE](./LICENSE).

## Credits

Built by [Bash Squad](https://www.bashsquad.com/).
