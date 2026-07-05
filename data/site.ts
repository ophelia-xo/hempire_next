/**
 * Single source of truth for band info, links, and navigation.
 * Update these values when things change. Nothing here is hard-coded
 * into components.
 */

export const site = {
  name: "Hempire",
  origin: "Asheville, North Carolina",
  // Short description used for SEO and the page header.
  description:
    "Hempire is a rock and roll band from Asheville, North Carolina.",
  url: "https://hempirerocks.com",
  email: "hempirerocks@gmail.com",
} as const;

export const socials = {
  bandcamp: "https://hempirerocks.bandcamp.com",
  instagram: "https://www.instagram.com/hempirerocks/",
  facebook: "https://www.facebook.com/hempirerocks",
} as const;

/**
 * Feature flags. Flip one to true and the section, along with its nav
 * links, comes back — no other changes needed.
 */
export const features: {
  music: boolean;
  merch: boolean;
  builtByCredit: boolean;
} = {
  music: false,
  merch: true,
  builtByCredit: false,
};

/**
 * Band bio, word for word from the band's Spotify bio.
 * Do not edit or paraphrase — the band wants exactly this text.
 */
export const bio = [
  "Bringing the party one riff at a time, Asheville hash thrashers Hempire prioritize giving it all at every show - inviting all walks of life for a taste of the rock and roll damnation. Mosey on down when Hempire’s in town and feel like you’re riding two motorcycles at the same time with slamming riffs, screaming solos, and punishing rhythms, all delivered with a friendly vibe. Satisfaction guaranteed.",
  "The first full length offering from Hempire - THE WEIGHT - brings together a classic vibe from legends like Motörhead and Iron Maiden combined with late-aughts titans High on Fire, including a thematic nod to traditional country heroes like George and Waylon. Inspired by the constant tug-of-war of life and death, Hempire levels the typical smoke show of rock to a relatable level playing field. This album is for those that burn it at both ends, those working hard to help those around them, for the weary traveler who only sees strangers, and for those who understand the seed sowers’ sorrow. It’s a hell of a thing, and you’re invited.",
];

export type NavLink = { label: string; href: string };

export const navLinks: NavLink[] = [
  { label: "Shows", href: "#shows" },
  ...(features.music ? [{ label: "Music", href: "#music" }] : []),
  ...(features.merch ? [{ label: "Merch", href: "#merch" }] : []),
  { label: "Contact", href: "#contact" },
];
