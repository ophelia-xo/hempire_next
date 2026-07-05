import Image from "next/image";
import type { CSSProperties } from "react";
import heroImg from "@/public/images/band-triptych.jpg";
import wordmark from "@/public/images/wordmark.png";
import { site } from "@/data/site";
import { shows } from "@/data/shows";
import { formatShowDate, isUpcoming } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { ArrowRight } from "@/components/icons";

/** Stagger helper for the load-in cascade. */
const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

export function Hero() {
  const nextShow = [...shows]
    .filter((s) => isUpcoming(s.date))
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <section id="top" className="grain relative min-h-[100svh] overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <Image
          src={heroImg}
          alt="The three members of Hempire on stage"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Dark wash so the type stays readable over the photo */}
      <div aria-hidden className="absolute inset-0 bg-ink/55" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/25 to-ink"
      />

      <div className="shell relative z-10 flex min-h-[100svh] flex-col items-center justify-center gap-7 py-28 text-center">
        <p className="kicker hero-rise" style={d(0.1)}>
          {site.origin}
        </p>

        <h1 className="sr-only">Hempire</h1>
        <div className="hero-rise" style={d(0.25)}>
          <Image
            src={wordmark}
            alt=""
            priority
            sizes="(min-width: 640px) 44rem, 88vw"
            className="h-auto w-[min(88vw,44rem)] [filter:drop-shadow(0_12px_40px_rgba(0,0,0,0.65))]"
          />
        </div>

        <div
          className="hero-rise flex flex-wrap items-center justify-center gap-3"
          style={d(0.45)}
        >
          <CopyEmail email={site.email} />
          <Button href="#shows" variant="outline" size="lg">
            Upcoming Shows
          </Button>
        </div>

        {nextShow && (
          <a
            href="#shows"
            className="group hero-rise inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-bone/10 bg-ink/40 px-6 py-2.5 text-sm text-smoke backdrop-blur-sm transition-colors hover:border-ember/50 hover:text-bone"
            style={d(0.6)}
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
