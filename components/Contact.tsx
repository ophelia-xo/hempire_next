import { site, socials } from "@/data/site";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { Reveal } from "@/components/Reveal";
import { InstagramIcon, FacebookIcon, BandcampIcon } from "@/components/icons";

const channels = [
  { label: "Instagram", href: socials.instagram, Icon: InstagramIcon },
  { label: "Facebook", href: socials.facebook, Icon: FacebookIcon },
  { label: "Bandcamp", href: socials.bandcamp, Icon: BandcampIcon },
];

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-20 py-14 sm:pb-24 sm:pt-16">
      <div className="mx-auto w-full max-w-3xl px-6">
        <Reveal>
          <h2 className="border-t border-edge pt-10 text-4xl text-bone sm:text-5xl">
            Booking Inquiries
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-8 flex justify-start">
            <CopyEmail email={site.email} />
          </div>
        </Reveal>

        <Reveal delay={220}>
          <div className="mt-10 flex items-center gap-4">
            {channels.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Hempire on ${label}`}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-edge text-bone transition-colors duration-200 hover:border-ember hover:text-ember"
              >
                <Icon className="text-xl" />
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
