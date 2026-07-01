import Image from "next/image";
import { album } from "@/data/album";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { BandcampIcon } from "@/components/icons";

export function Music() {
  return (
    <section id="music" className="scroll-mt-20 py-20 sm:py-28">
      <div className="shell">
        <SectionHeading
          kicker="New Record"
          title={album.title}
          description={album.blurb}
        />

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
          {/* Cover + actions */}
          <div>
            <div className="grain overflow-hidden rounded-2xl border border-edge">
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
              <Button href={album.bandcampUrl} external variant="primary" size="lg">
                <BandcampIcon className="text-lg" />
                Listen on Bandcamp
              </Button>
              <Button href={album.bandcampUrl} external variant="outline" size="lg">
                Get the CD
              </Button>
            </div>
          </div>

          {/* Tracklist + player */}
          <div>
            <ol className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
              {album.tracks.map((track, i) => (
                <li
                  key={track}
                  className="flex items-baseline gap-4 border-b border-edge/70 py-3"
                >
                  <span className="font-display text-lg text-ember tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-bone">{track}</span>
                </li>
              ))}
            </ol>

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
          </div>
        </div>
      </div>
    </section>
  );
}
