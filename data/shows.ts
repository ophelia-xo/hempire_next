/**
 * Upcoming shows.
 *
 * To add a show, copy a block and fill it in. `date` is ISO (YYYY-MM-DD)
 * so it sorts and formats correctly. Past shows are filtered out
 * automatically on the page. Set `ticketUrl` to null for free / at-the-door
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

export const shows: Show[] = [
  {
    id: "sly-grog-2026-07",
    date: "2026-07-31",
    venue: "Sly Grog Lounge",
    city: "Asheville, NC",
    note: "271 Haywood St",
    ticketUrl: "https://theslygrogavl.com/",
  },
  {
    id: "avl-sounds-fest-2026",
    date: "2026-08-06",
    venue: "AVL Sounds Fest",
    city: "Asheville, NC",
    note: "Aug 6 to 9 / multi-venue festival",
    ticketUrl:
      "https://www.etix.com/ticket/p/36960932/avl-sounds-fest-asheville-avl-sounds-fest",
  },
];
