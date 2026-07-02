import Image from "next/image";
import { album } from "@/data/album";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { BandcampIcon } from "@/components/icons";

export function Music() {
  return (
    <section
      id="music"
      className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28"
    >
      <span aria-hidden className="ghost-word">
        Loud
      </span>

      <div className="shell relative">
        <Reveal>
          <SectionHeading
            kicker="New Record"
            title={album.title}
            description={album.blurb}
          />
        </Reveal>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
          {/* Cover + actions */}
          <Reveal>
            <div className="group relative">
              {/* The record itself, peeking out of the sleeve. Slides further
                  and spins up when you reach for it. */}
              <div
                aria-hidden
                className="absolute inset-y-[4%] right-0 aspect-square translate-x-10 transition-transform duration-700 ease-out group-hover:translate-x-14"
              >
                <div className="vinyl h-full w-full animate-spin-slow" />
              </div>

              <div className="grain relative z-10 overflow-hidden rounded-2xl border border-edge shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] transition-shadow duration-500 group-hover:shadow-[0_30px_90px_-20px_rgba(255,122,26,0.25)]">
                <Image
                  src={album.cover}
                  alt={`Album cover for ${album.title} by Hempire`}
                  placeholder="blur"
                  sizes="(min-width: 1024px) 26rem, 100vw"
                  className="block h-auto w-full"
                />
              </div>
            </div>
            <p className="mt-5 text-sm uppercase tracking-widest text-smoke">
              {album.releaseLabel}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                href={album.bandcampUrl}
                external
                variant="primary"
                size="lg"
              >
                <BandcampIcon className="text-lg" />
                Listen on Bandcamp
              </Button>
              <Button
                href={album.bandcampUrl}
                external
                variant="outline"
                size="lg"
              >
                Get the CD
              </Button>
            </div>
          </Reveal>

          {/* Tracklist + player */}
          <div>
            <ol className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
              {album.tracks.map((track, i) => (
                <Reveal
                  as="li"
                  key={track}
                  delay={i * 50}
                  className="group/track flex items-baseline gap-4 border-b border-edge/70 px-2 py-3 transition-colors duration-200 hover:bg-bone/[0.03]"
                >
                  <span className="font-display text-lg text-ember tabular-nums transition-colors group-hover/track:text-ember-bright">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-bone transition-transform duration-200 group-hover/track:translate-x-1">
                    {track}
                  </span>
                </Reveal>
              ))}
            </ol>

            <Reveal delay={200}>
              <iframe
                title={`Bandcamp player for ${album.title} by Hempire`}
                className="mt-8 block h-[120px] w-full overflow-hidden rounded-lg border border-edge"
                src={`https://bandcamp.com/EmbeddedPlayer/album=${album.bandcampAlbumId}/size=large/bgcol=0a0a0b/linkcol=ff7a1a/artwork=small/tracklist=false/transparent=true/`}
                seamless
                loading="lazy"
              />
              <p className="mt-3 text-sm text-smoke">
                Press play for a taste, then grab the whole thing on Bandcamp.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
