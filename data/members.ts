import joey from "@/public/images/members/joey.jpg";
import jon from "@/public/images/members/jon.jpg";
import jason from "@/public/images/members/jason.jpg";
import type { StaticImageData } from "next/image";

export type Member = {
  name: string;
  role: string;
  photo: StaticImageData;
  alt: string;
};

export const members: Member[] = [
  {
    name: "Joey Shaw",
    role: "Guitar / Vocals",
    photo: joey,
    alt: "Joey Shaw singing into the mic mid-set, guitar raised overhead",
  },
  {
    name: "Jon Andre",
    role: "Drums",
    photo: jon,
    alt: "Jon Andre behind the kit, sticks in hand",
  },
  {
    name: "Jason Watson",
    role: "Bass",
    photo: jason,
    alt: "Jason Watson locked into a bass line on stage",
  },
];
