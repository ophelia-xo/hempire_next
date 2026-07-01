/**
 * Single source of truth for band info, links, and navigation.
 * Update these values when things change. Nothing here is hard-coded
 * into components.
 */

export const site = {
  name: "Hempire",
  tagline: "High Country Hash Thrash",
  origin: "Asheville, North Carolina",
  // Short description used for SEO and the page header.
  description:
    "Hempire is a rock and roll band based in Asheville, North Carolina. Heavy riffs, mountain fuzz, and a whole lot of volume.",
  url: "https://hempirerocks.com",
  email: "hempirerocks@gmail.com",
} as const;

export const socials = {
  bandcamp: "https://hempirerocks.bandcamp.com",
  instagram: "https://www.instagram.com/hempirerocks/",
  facebook: "https://www.facebook.com/hempirerocks",
} as const;

export type NavLink = { label: string; href: string };

export const navLinks: NavLink[] = [
  { label: "Shows", href: "#shows" },
  { label: "Music", href: "#music" },
  { label: "Merch", href: "#merch" },
  { label: "Band", href: "#band" },
  { label: "Contact", href: "#contact" },
];
