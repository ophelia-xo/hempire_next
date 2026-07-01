"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import wordmark from "@/public/images/wordmark.png";
import { navLinks, socials } from "@/data/site";
import { cn } from "@/lib/utils";
import { MenuIcon, CloseIcon } from "@/components/icons";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Solidify the bar once the hero scrolls away.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium uppercase tracking-wider text-smoke transition-colors hover:text-bone"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={socials.bandcamp}
              target="_blank"
              rel="noreferrer noopener"
              className="ml-2 inline-flex items-center rounded-full border border-ember px-4 py-2 text-sm font-semibold uppercase tracking-wider text-ember transition-colors hover:bg-ember hover:text-ink"
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

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-edge bg-ink md:hidden"
      >
        <ul className="shell flex min-h-[calc(100svh-4.5rem)] flex-col justify-center gap-1 py-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-3 font-display text-3xl tracking-wide text-bone transition-colors hover:text-ember"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-3">
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
