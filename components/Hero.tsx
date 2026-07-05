import Image from "next/image";
import type { CSSProperties } from "react";
import wordmark from "@/public/images/wordmark.png";
import { site, bio } from "@/data/site";
import { members } from "@/data/members";
import { CopyEmailInline } from "@/components/ui/CopyEmail";

/** Stagger helper for the load-in cascade. */
const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

export function Hero() {
  return (
    <section id="top" className="pb-16 pt-32 sm:pb-20 sm:pt-40">
      <div className="mx-auto w-full max-w-3xl px-6">
        <h1 className="sr-only">Hempire</h1>
        <div className="hero-rise flex justify-center" style={d(0.1)}>
          <Image
            src={wordmark}
            alt=""
            priority
            sizes="(min-width: 640px) 26rem, 80vw"
            className="h-auto w-[min(80vw,26rem)] [filter:drop-shadow(0_8px_24px_rgba(0,0,0,0.6))]"
          />
        </div>

        <p
          className="hero-rise mt-6 text-center text-xs font-semibold uppercase tracking-[0.3em] text-ember"
          style={d(0.25)}
        >
          Asheville, NC
        </p>

        <div
          className="hero-rise mt-12 space-y-5 leading-relaxed text-bone/90 sm:text-lg"
          style={d(0.4)}
        >
          {bio.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>

        <ul
          className="hero-rise mt-10 space-y-1 border-l-2 border-ember/70 pl-5"
          style={d(0.55)}
        >
          {members.map((member) => (
            <li key={member.name} className="text-bone">
              {member.name}
              <span className="text-smoke"> — {member.role}</span>
            </li>
          ))}
        </ul>

        <p className="hero-rise mt-10 text-bone" style={d(0.75)}>
          All booking inquiries: <CopyEmailInline email={site.email} />
        </p>
      </div>
    </section>
  );
}
