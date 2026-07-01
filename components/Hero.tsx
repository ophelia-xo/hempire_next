import Image from "next/image";
import heroImg from "@/public/images/band-triptych.jpg";
import wordmark from "@/public/images/wordmark.png";
import { site } from "@/data/site";
import { shows } from "@/data/shows";
import { formatShowDate, isUpcoming } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ArrowRight, PlayIcon } from "@/components/icons";

export function Hero() {
  const nextShow = [...shows]
    .filter((s) => isUpcoming(s.date))
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <section id="top" className="grain relative min-h-[100svh] overflow-hidden">
      {/* Live band photo, dropped back to an atmospheric texture */}
      <Image
        src={heroImg}
        alt="The three members of Hempire on stage"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-ink/60" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/30 to-ink"
      />

      <div className="shell relative z-10 flex min-h-[100svh] flex-col items-center justify-center gap-7 py-28 text-center">
        <p className="kicker">{site.origin} / Rock and Roll</p>

        <h1 className="sr-only">
          Hempire, a rock and roll band from Asheville, North Carolina
        </h1>
        <Image
          src={wordmark}
          alt=""
          priority
          sizes="(min-width: 640px) 44rem, 88vw"
          className="h-auto w-[min(88vw,44rem)]"
        />

        <p className="max-w-xl text-lg leading-relaxed text-bone/90 sm:text-xl">
          Heavy riffs and mountain fuzz out of the High Country. Turn it up.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button href="#music" variant="primary" size="lg">
            <PlayIcon className="text-lg" />
            Hear The Weight
          </Button>
          <Button href="#shows" variant="outline" size="lg">
            Upcoming Shows
          </Button>
        </div>

        {nextShow && (
          <a
            href="#shows"
            className="group inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-smoke transition-colors hover:text-bone"
          >
            <span className="font-semibold uppercase tracking-widest text-ember">
              Next Show
            </span>
            <span className="text-bone">
              {formatShowDate(nextShow.date).month}{" "}
              {formatShowDate(nextShow.date).day} / {nextShow.venue} /{" "}
              {nextShow.city}
            </span>
            <ArrowRight className="text-base transition-transform group-hover:translate-x-1" />
          </a>
        )}
      </div>
    </section>
  );
}
