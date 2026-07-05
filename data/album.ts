import cover from "@/public/images/album/the-weight.jpg";
import type { StaticImageData } from "next/image";

export type Album = {
  title: string;
  releaseLabel: string;
  /** Numeric id from the Bandcamp EmbeddedPlayer URL (album=NNN) */
  bandcampAlbumId: string;
  bandcampUrl: string;
  cover: StaticImageData;
  blurb: string;
  tracks: string[];
};

export const album: Album = {
  title: "The Weight",
  releaseLabel: "Released January 2025",
  bandcampAlbumId: "505290538",
  bandcampUrl: "https://hempirerocks.bandcamp.com/album/the-weight",
  cover,
  // Straight from the band's Spotify bio.
  blurb:
    "The first full length offering from Hempire - THE WEIGHT - brings together a classic vibe from legends like Motörhead and Iron Maiden combined with late-aughts titans High on Fire, including a thematic nod to traditional country heroes like George and Waylon. Inspired by the constant tug-of-war of life and death, Hempire levels the typical smoke show of rock to a relatable level playing field. This album is for those that burn it at both ends, those working hard to help those around them, for the weary traveler who only sees strangers, and for those who understand the seed sowers' sorrow. It's a hell of a thing, and you're invited.",
  tracks: [
    "Nugrunner",
    "The Grind",
    "Sound of the Hellbound",
    "Without the Darkness",
    "Wasn't Born Yesterday",
    "Deathbringers, Inc.",
    "Gravedigger",
    "Bongbroth",
    "Deathtrap",
    "Ain't Leavin' Here Alive",
  ],
};
