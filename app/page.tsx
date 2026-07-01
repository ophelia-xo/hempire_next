import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { About } from "@/components/About";
import { Shows } from "@/components/Shows";
import { Music } from "@/components/Music";
import { Merch } from "@/components/Merch";
import { Contact } from "@/components/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Shows />
      <Music />
      <Merch />
      <About />
      <Contact />
    </>
  );
}
