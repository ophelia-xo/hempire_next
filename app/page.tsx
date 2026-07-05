import { Hero } from "@/components/Hero";
import { Shows } from "@/components/Shows";
import { Music } from "@/components/Music";
import { Merch } from "@/components/Merch";
import { Contact } from "@/components/Contact";
import { features } from "@/data/site";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Shows />
      {features.music && <Music />}
      {features.merch && <Merch />}
      <Contact />
    </>
  );
}
