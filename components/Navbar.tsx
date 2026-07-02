"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import wordmark from "@/public/images/wordmark.png";
import { navLinks, socials } from "@/data/site";
import { cn } from "@/lib/utils";
import { MenuIcon, CloseIcon } from "@/components/icons";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Solidify the bar once the hero scrolls away, and keep the reading
  // progress hairline in sync. Progress writes straight to the DOM node so
  // scrolling never re-renders the component tree.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      setScrolled(window.scrollY > 24);
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progressRef.current?.style.setProperty("transform", `scaleX(${p})`);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Scrollspy: light the link for the section currently in the readable band
  // of the viewport. The hero (#top) clears the highlight.
  useEffect(() => {
    const ids = ["top", ...navLinks.map((l) => l.href.slice(1))];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setActive(entry.target.id === "top" ? null : entry.target.id);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Lock body scroll and close on Escape while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-b border-edge bg-ink/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="shell flex h-[4.5rem] items-center justify-between"
      >
        <a
          href="#top"
          className="flex items-center"
          aria-label="Hempire, back to top"
        >
          <Image
            src={wordmark}
            alt=""
            width={1022}
            height={340}
            className="h-7 w-auto"
            priority
          />
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = active === link.href.slice(1);
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors",
                    isActive
                      ? "text-ember"
                      : "text-smoke hover:text-bone",
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-4 -bottom-px h-px bg-ember transition-transform duration-300",
                      isActive ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </a>
              </li>
            );
          })}
          <li>
            <a
              href={socials.bandcamp}
              target="_blank"
              rel="noreferrer noopener"
              className="ml-2 inline-flex items-center rounded-full border border-ember px-4 py-2 text-sm font-semibold uppercase tracking-wider text-ember transition-all duration-200 hover:bg-ember hover:text-ink hover:shadow-[0_0_24px_rgba(255,122,26,0.4)]"
            >
              Listen
            </a>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-bone md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? (
            <CloseIcon className="text-2xl" />
          ) : (
            <MenuIcon className="text-2xl" />
          )}
        </button>
      </nav>

      {/* Reading progress, an ember hairline under the bar */}
      <div
        ref={progressRef}
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-ember-deep via-ember to-ember-bright"
      />

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-edge bg-ink md:hidden"
      >
        <ul className="shell flex min-h-[calc(100svh-4.5rem)] flex-col justify-center gap-1 py-8">
          {navLinks.map((link, i) => (
            <li
              key={link.href}
              className="menu-rise"
              style={{ "--d": `${80 + i * 60}ms` } as CSSProperties}
            >
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="group flex items-baseline gap-4 py-3 font-display text-4xl tracking-wide text-bone transition-colors hover:text-ember"
              >
                <span
                  aria-hidden
                  className="text-sm text-ember/70 tabular-nums"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {link.label}
              </a>
            </li>
          ))}
          <li
            className="menu-rise pt-4"
            style={{ "--d": `${80 + navLinks.length * 60}ms` } as CSSProperties}
          >
            <a
              href={socials.bandcamp}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-full bg-ember px-6 py-3 font-semibold uppercase tracking-wider text-ink"
            >
              Listen on Bandcamp
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
