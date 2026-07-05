import Image from "next/image";
import { members } from "@/data/members";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/Reveal";

export function About() {
  return (
    <section
      id="band"
      className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28"
    >
      <div className="shell relative">
        <Reveal>
          <SectionHeading
            title="The Band"
            // Straight from the band's Spotify bio.
            description="Bringing the party one riff at a time, Asheville hash thrashers Hempire prioritize giving it all at every show - inviting all walks of life for a taste of the rock and roll damnation. Mosey on down when Hempire's in town and feel like you're riding two motorcycles at the same time with slamming riffs, screaming solos, and punishing rhythms, all delivered with a friendly vibe. Satisfaction guaranteed."
            className="max-w-3xl"
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-3">
          {members.map((member, i) => (
            <Reveal as="li" key={member.name} delay={i * 110}>
              <div className="relative grain aspect-square overflow-hidden rounded-xl border border-edge">
                <Image
                  src={member.photo}
                  alt={member.alt}
                  fill
                  sizes="(min-width: 1024px) 24rem, 50vw"
                  placeholder="blur"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-4 text-2xl text-bone sm:text-3xl">
                {member.name}
              </h3>
              <p className="mt-1 text-sm font-medium uppercase tracking-widest text-ember">
                {member.role}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
