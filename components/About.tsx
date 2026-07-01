import Image from "next/image";
import triptych from "@/public/images/band-triptych.jpg";
import { members } from "@/data/members";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function About() {
  return (
    <section id="band" className="scroll-mt-20 py-20 sm:py-28">
      <div className="shell">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            kicker="The Band"
            title={
              <>
                Three from the
                <br />
                High Country
              </>
            }
            description="Out of the mountains of Western North Carolina, Hempire is three friends, a wall of amps, and a steady diet of fuzz. They play heavy, they play often, and they leave the room ringing."
          />

          <div className="relative grain aspect-square overflow-hidden rounded-2xl border border-edge">
            <Image
              src={triptych}
              alt="The three members of Hempire on stage, shown side by side"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 36rem, 100vw"
              placeholder="blur"
            />
          </div>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-3">
          {members.map((member) => (
            <li key={member.name} className="group">
              <div className="relative grain aspect-square overflow-hidden rounded-xl border border-edge">
                <Image
                  src={member.photo}
                  alt={member.alt}
                  fill
                  sizes="(min-width: 1024px) 24rem, 50vw"
                  placeholder="blur"
                  className="object-cover grayscale transition-[transform,filter] duration-500 group-hover:scale-105 group-hover:grayscale-0"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent"
                />
              </div>
              <h3 className="mt-4 text-2xl text-bone sm:text-3xl">
                {member.name}
              </h3>
              <p className="mt-1 text-sm font-medium uppercase tracking-widest text-ember">
                {member.role}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
