import Image from "next/image";
import { merch } from "@/data/merch";
import { socials } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { BandcampIcon } from "@/components/icons";

export function Merch() {
  return (
    <section
      id="merch"
      className="relative scroll-mt-20 overflow-hidden bg-coal py-20 sm:py-28"
    >
      <div className="shell relative">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading title="Merch" />
            <Button
              href={socials.bandcamp}
              external
              variant="primary"
              className="self-start sm:self-auto"
            >
              <BandcampIcon className="text-lg" />
              Shop on Bandcamp
            </Button>
          </div>
        </Reveal>

        <ul className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6">
          {merch.map((item, i) => (
            <Reveal as="li" key={item.name} delay={(i % 3) * 90}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${item.name}, ${item.price}, on Bandcamp`}
                className="group block"
              >
                <div className="relative grain aspect-square overflow-hidden rounded-xl border border-edge bg-ink transition-colors duration-300 group-hover:border-ember/50">
                  <Image
                    src={item.photo}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 640px) 24rem, 50vw"
                    placeholder="blur"
                    className="object-cover object-center"
                  />
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <h3 className="text-xl text-bone">{item.name}</h3>
                  <span className="shrink-0 text-sm font-semibold text-ember">
                    {item.price}
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
