import Image from "next/image";
import wordmark from "@/public/images/wordmark.png";
import { site, socials } from "@/data/site";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { InstagramIcon, FacebookIcon, BandcampIcon } from "@/components/icons";

const channels = [
  { label: "Instagram", href: socials.instagram, Icon: InstagramIcon },
  { label: "Facebook", href: socials.facebook, Icon: FacebookIcon },
  { label: "Bandcamp", href: socials.bandcamp, Icon: BandcampIcon },
];

export function Contact() {
  return (
    <section
      id="contact"
      className="grain relative scroll-mt-20 overflow-hidden py-24 sm:py-32"
    >
      {/* Faint script watermark */}
      <Image
        src={wordmark}
        alt=""
        aria-hidden
        width={1022}
        height={340}
        className="pointer-events-none absolute left-1/2 top-1/2 w-[52rem] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"
      />

      <div className="shell relative text-center">
        <p className="kicker justify-center">Get In Touch</p>
        <h2 className="display-2 mt-4 text-bone">Booking &amp; Hellos</h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-smoke sm:text-lg">
          Booking a show, putting on a festival, or just want to say what is up?
          Reach out and we will get back to you.
        </p>

        <div className="mt-8 flex justify-center">
          <CopyEmail email={site.email} />
        </div>

        <div className="mt-12 flex items-center justify-center gap-4">
          {channels.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Hempire on ${label}`}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-edge text-bone transition-colors hover:border-ember hover:text-ember"
            >
              <Icon className="text-2xl" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
