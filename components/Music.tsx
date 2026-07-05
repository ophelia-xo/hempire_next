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
      <div className="shell relative">
        <Reveal>
          <SectionHeading title={album.title} description={album.blurb} />
        </Reveal>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
          {/* Cover + actions */}
          <Reveal>
            <div className="grain relative overflow-hidden rounded-2xl border border-edge shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
              <Image
                src={album.cover}
                alt={`Album cover for ${album.title} by Hempire`}
                placeholder="blur"
                sizes="(min-width: 1024px) 26rem, 100vw"
                className="block h-auto w-full"
              />
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
                  className="flex items-baseline gap-4 border-b border-edge/70 px-2 py-3"
                >
                  <span className="font-display text-lg text-ember tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-bone">{track}</span>
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
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
