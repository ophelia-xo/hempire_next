import Image from "next/image";
import wordmark from "@/public/images/wordmark.png";
import { site, socials, navLinks } from "@/data/site";
import { InstagramIcon, FacebookIcon, BandcampIcon } from "@/components/icons";

const channels = [
  { label: "Instagram", href: socials.instagram, Icon: InstagramIcon },
  { label: "Facebook", href: socials.facebook, Icon: FacebookIcon },
  { label: "Bandcamp", href: socials.bandcamp, Icon: BandcampIcon },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-edge bg-ink">
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
              {site.tagline}. Rock and roll out of {site.origin}.
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
                className="flex h-11 w-11 items-center justify-center rounded-full border border-edge text-bone transition-colors hover:border-ember hover:text-ember"
              >
                <Icon className="text-xl" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-edge pt-6 text-xs text-smoke sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} Hempire. All rights reserved.
          </p>
          <p className="text-smoke">
            Built by{" "}
            <a
              href="https://www.bashsquad.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="underline-offset-4 transition-colors hover:text-bone hover:underline"
            >
              Bash Squad
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
