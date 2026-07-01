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
  blurb:
    "Ten tracks of high country fuzz. Their first record pressed to disc, recorded loud and meant to be played louder.",
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
