import { shows } from "@/data/shows";
import { socials, site } from "@/data/site";
import { formatShowDate, isUpcoming } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CopyEmailInline } from "@/components/ui/CopyEmail";
import { Reveal } from "@/components/Reveal";
import { ArrowUpRight, PinIcon } from "@/components/icons";

export function Shows() {
  const upcoming = shows
    .filter((s) => isUpcoming(s.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section
      id="shows"
      className="relative scroll-mt-20 overflow-hidden bg-coal py-20 sm:py-28"
    >
      <span aria-hidden className="ghost-word">
        Live
      </span>

      <div className="shell relative">
        <Reveal>
          <SectionHeading
            kicker="On Tour"
            title="Upcoming Shows"
            description="Catch Hempire live. Doors, ticket links, and the occasional last-minute add land here first."
          />
        </Reveal>

        {upcoming.length > 0 ? (
          <ul className="mt-12 border-t border-edge">
            {upcoming.map((show, i) => {
              const d = formatShowDate(show.date);
              return (
                <Reveal
                  as="li"
                  key={show.id}
                  delay={i * 90}
                  className="group relative flex flex-col gap-4 border-b border-edge py-6 sm:flex-row sm:items-center sm:gap-8 sm:py-8"
                >
                  {/* Heat wash sweeps in from the left on hover */}
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-r from-ember/[0.07] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  {/* Date, ticket-stub style */}
                  <div className="relative flex shrink-0 items-baseline gap-3 sm:w-36 sm:flex-col sm:items-start sm:gap-0">
                    <span className="font-display text-6xl leading-none text-ember transition-colors duration-300 group-hover:text-ember-bright">
                      {d.day}
                    </span>
                    <span className="font-display text-2xl leading-none text-bone sm:mt-1">
                      {d.month}
                    </span>
                    <span className="text-sm text-smoke sm:mt-1">
                      {d.weekday} / {d.year}
                    </span>
                  </div>

                  {/* Venue */}
                  <div className="relative min-w-0 flex-1">
                    <h3 className="text-2xl text-bone transition-transform duration-300 sm:text-4xl sm:group-hover:translate-x-2">
                      {show.venue}
                    </h3>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-smoke sm:transition-transform sm:duration-300 sm:delay-75 sm:group-hover:translate-x-2">
                      <PinIcon className="text-base text-smoke" />
                      <span>{show.city}</span>
                      {show.note && (
                        <>
                          <span aria-hidden className="text-edge">
                            /
                          </span>
                          <span>{show.note}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="relative shrink-0">
                    {show.ticketUrl ? (
                      <a
                        href={show.ticketUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-2 rounded-full border border-edge px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-bone transition-all duration-300 group-hover:border-ember group-hover:shadow-[0_0_24px_rgba(255,122,26,0.25)] hover:bg-ember hover:text-ink"
                      >
                        Tickets
                        <ArrowUpRight className="text-base transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        <span className="sr-only">for {show.venue}</span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-edge px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-smoke">
                        Free Show
                      </span>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </ul>
        ) : (
          <Reveal>
            <div className="mt-12 rounded-2xl border border-edge bg-ink/40 p-10 text-center">
              <p className="font-display text-3xl text-bone">
                No shows on the books right now
              </p>
              <p className="mx-auto mt-3 max-w-md text-smoke">
                We are always cooking up the next one. Follow along to hear
                about new dates the moment they drop.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-full bg-ember px-6 py-3 text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-ember-bright"
                >
                  Follow on Instagram
                </a>
              </div>
            </div>
          </Reveal>
        )}

        <Reveal delay={150}>
          <p className="mt-8 text-sm text-smoke">
            Want Hempire at your venue or festival?{" "}
            <CopyEmailInline email={site.email} />
          </p>
        </Reveal>
      </div>
    </section>
  );
}
