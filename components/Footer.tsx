import Image from "next/image";
import wordmark from "@/public/images/wordmark.png";
import { site, socials, navLinks, features } from "@/data/site";
import { ArrowUpIcon, InstagramIcon, FacebookIcon, BandcampIcon } from "@/components/icons";

const channels = [
  { label: "Instagram", href: socials.instagram, Icon: InstagramIcon },
  { label: "Facebook", href: socials.facebook, Icon: FacebookIcon },
  { label: "Bandcamp", href: socials.bandcamp, Icon: BandcampIcon },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-edge bg-ink">
      <div className="shell py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
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
                className="h-8 w-auto"
              />
            </a>
            <p className="mt-4 text-sm leading-relaxed text-smoke">
              {site.origin}.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium uppercase tracking-wider text-smoke transition-colors hover:text-bone"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex gap-3">
            {channels.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Hempire on ${label}`}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-edge text-bone transition-all duration-300 hover:-translate-y-0.5 hover:border-ember hover:text-ember"
              >
                <Icon className="text-xl" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-edge pt-6 text-xs text-smoke sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Hempire. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {features.builtByCredit && (
              <p className="flex items-center gap-1.5 text-smoke">
                <span>Built by</span>
                <a
                  href="https://www.bashsquad.com/"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Built by Bash Squad"
                  className="group inline-flex items-center gap-1 opacity-80 transition-opacity hover:opacity-100"
                >
                  <span aria-hidden className="font-bold text-[#b5e853]">
                    &gt;
                  </span>
                  <span className="font-semibold tracking-tight text-bone/90 group-hover:text-bone">
                    bash squad
                  </span>
                </a>
              </p>
            )}
            <a
              href="#top"
              className="group inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-smoke transition-colors hover:text-ember"
            >
              Back to top
              <ArrowUpIcon className="text-sm transition-transform group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
