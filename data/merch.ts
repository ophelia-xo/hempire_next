import donkeyTee from "@/public/images/merch/donkey-tee.jpg";
import realtreeTee from "@/public/images/merch/realtree-tee.jpg";
import whiteReaperTee from "@/public/images/merch/white-reaper-tee.jpg";
import logoHoodie from "@/public/images/merch/logo-hoodie.jpg";
import logoHat from "@/public/images/merch/logo-hat.jpg";
import theWeightCd from "@/public/images/merch/the-weight-cd.jpg";
import type { StaticImageData } from "next/image";

export type MerchItem = {
  name: string;
  price: string;
  photo: StaticImageData;
  alt: string;
  /** Direct Bandcamp product page for this item */
  href: string;
};

const store = "https://hempirerocks.bandcamp.com";

/**
 * Merch is sold through Bandcamp and at the merch table. Keep this in sync
 * with hempirerocks.bandcamp.com/merch. Each item links straight to its
 * Bandcamp product page.
 */
export const merch: MerchItem[] = [
  {
    name: "Double Donkey Tee",
    price: "$15",
    photo: donkeyTee,
    alt: "Black Hempire tee with the double donkey back print",
    href: `${store}/merch/the-weight-double-donkey-tee`,
  },
  {
    name: "Realtree Logo Tee",
    price: "$25",
    photo: realtreeTee,
    alt: "Realtree camo tee with the orange Hempire logo",
    href: `${store}/merch/real-tree-nascar-logo-tee-medium`,
  },
  {
    name: "White Reaper Tee",
    price: "$15",
    photo: whiteReaperTee,
    alt: "White tee with the High Country Hash Thrash reaper back print",
    href: `${store}/merch/white-reaper-tee`,
  },
  {
    name: "Logo Hoodie",
    price: "$25",
    photo: logoHoodie,
    alt: "Hempire pullover hoodie with the script logo",
    href: `${store}/merch/hempire-logo-hoodie`,
  },
  {
    name: "Embroidered Hat",
    price: "$25",
    photo: logoHat,
    alt: "Black trucker hat with the embroidered Hempire script logo",
    href: `${store}/merch/embroidered-logo-hat`,
  },
  {
    name: "The Weight CD",
    price: "$5",
    photo: theWeightCd,
    alt: "The Weight digipack CD by Hempire",
    href: `${store}/album/the-weight`,
  },
];
