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
    <section
      id="contact"
      className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32"
    >
      <div className="shell relative text-center">
        <Reveal>
          <h2 className="display-2 text-bone">Booking Inquiries</h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-8 flex justify-center">
            <CopyEmail email={site.email} />
          </div>
        </Reveal>

        <Reveal delay={220}>
          <div className="mt-12 flex items-center justify-center gap-4">
            {channels.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Hempire on ${label}`}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-edge text-bone transition-colors duration-200 hover:border-ember hover:text-ember"
              >
                <Icon className="text-2xl" />
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
