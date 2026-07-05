import Image from "next/image";
import { merch } from "@/data/merch";
import { socials } from "@/data/site";
import { Reveal } from "@/components/Reveal";
import { ArrowUpRight } from "@/components/icons";

export function Merch() {
  return (
    <section id="merch" className="scroll-mt-20 py-14 sm:py-16">
      <div className="mx-auto w-full max-w-3xl px-6">
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-edge pt-10">
            <h2 className="text-4xl text-bone sm:text-5xl">Merch</h2>
            <a
              href={socials.bandcamp}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ember underline-offset-4 hover:underline"
            >
              Shop on Bandcamp
              <ArrowUpRight className="text-base" />
            </a>
          </div>
        </Reveal>

        <ul className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
          {merch.map((item, i) => (
            <Reveal as="li" key={item.name} delay={(i % 3) * 90}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${item.name}, ${item.price}, on Bandcamp`}
                className="group block"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg border border-edge bg-coal transition-colors duration-300 group-hover:border-ember/50">
                  <Image
                    src={item.photo}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 640px) 15rem, 50vw"
                    placeholder="blur"
                    className="object-cover object-center"
                  />
                </div>
                <div className="mt-2.5 flex items-baseline justify-between gap-3">
                  <h3 className="text-base text-bone">{item.name}</h3>
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
