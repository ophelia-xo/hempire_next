import Image from "next/image";
import { merch } from "@/data/merch";
import { socials } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, BandcampIcon } from "@/components/icons";

export function Merch() {
  return (
    <section id="merch" className="scroll-mt-20 bg-coal py-20 sm:py-28">
      <div className="shell">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            kicker="Merch"
            title="Wear It Loud"
            description="Tees, koozies, patches, and the new record. Everything ships through Bandcamp, or grab it from the merch table at a show."
          />
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

        <ul className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6">
          {merch.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${item.name}, ${item.price}, on Bandcamp`}
                className="group block"
              >
                <div className="relative grain aspect-square overflow-hidden rounded-xl border border-edge bg-ink">
                  <Image
                    src={item.photo}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 640px) 24rem, 50vw"
                    placeholder="blur"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink/70 text-bone opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowUpRight className="text-base" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <h3 className="text-xl text-bone">{item.name}</h3>
                  <span className="shrink-0 text-sm font-semibold text-ember">
                    {item.price}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
