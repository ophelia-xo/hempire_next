import Image from "next/image";
import type { CSSProperties } from "react";
import heroImg from "@/public/images/band-triptych.jpg";
import wordmark from "@/public/images/wordmark.png";
import { site } from "@/data/site";
import { shows } from "@/data/shows";
import { formatShowDate, isUpcoming } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ArrowRight, PlayIcon } from "@/components/icons";

/** Stagger helper for the load-in cascade. */
const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

export function Hero() {
  const nextShow = [...shows]
    .filter((s) => isUpcoming(s.date))
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <section id="top" className="grain relative min-h-[100svh] overflow-hidden">
      {/* Live band photo settling into place, cinema-style */}
      <div aria-hidden className="hero-zoom absolute inset-0">
        <Image
          src={heroImg}
          alt="The three members of Hempire on stage"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Atmosphere: dark wash, fade to ink, ember heat off the stage floor */}
      <div aria-hidden className="absolute inset-0 bg-ink/55" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/25 to-ink"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(70%_90%_at_50%_105%,rgba(255,122,26,0.16),transparent_65%)]"
      />
      {/* Vignette pulls the eye to center stage */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(10,10,11,0.7)_100%)]"
      />

      <div className="shell relative z-10 flex min-h-[100svh] flex-col items-center justify-center gap-7 py-28 text-center">
        <p className="kicker hero-rise" style={d(0.1)}>
          {site.origin} / Rock and Roll
        </p>

        <h1 className="sr-only">
          Hempire, a rock and roll band from Asheville, North Carolina
        </h1>
        <div className="hero-rise" style={d(0.25)}>
          <Image
            src={wordmark}
            alt=""
            priority
            sizes="(min-width: 640px) 44rem, 88vw"
            className="h-auto w-[min(88vw,44rem)] [filter:drop-shadow(0_12px_40px_rgba(0,0,0,0.65))_drop-shadow(0_0_70px_rgba(255,122,26,0.18))]"
          />
        </div>

        <p
          className="hero-rise max-w-xl text-lg leading-relaxed text-bone/90 sm:text-xl"
          style={d(0.45)}
        >
          Heavy riffs and mountain fuzz out of the High Country. Turn it up.
        </p>

        <div
          className="hero-rise flex flex-wrap items-center justify-center gap-3"
          style={d(0.6)}
        >
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
            className="group hero-rise inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-bone/10 bg-ink/40 px-6 py-2.5 text-sm text-smoke backdrop-blur-sm transition-colors hover:border-ember/50 hover:text-bone"
            style={d(0.75)}
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

      {/* Scroll cue: an ember spark running down a hairline */}
      <div
        aria-hidden
        className="hero-rise absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2.5"
        style={d(1.1)}
      >
        <span className="text-[0.625rem] font-semibold uppercase tracking-[0.3em] text-smoke">
          Scroll
        </span>
        <span className="relative h-12 w-px overflow-hidden bg-bone/15">
          <span className="absolute inset-0 animate-cue bg-gradient-to-b from-transparent via-ember to-ember" />
        </span>
      </div>
    </section>
  );
}
