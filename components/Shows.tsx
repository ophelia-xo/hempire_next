import { shows } from "@/data/shows";
import { socials } from "@/data/site";
import { formatShowDate, isUpcoming } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
      <div className="shell relative">
        <Reveal>
          <SectionHeading title="Shows" />
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
                  {/* Date, ticket-stub style */}
                  <div className="relative flex shrink-0 items-baseline gap-3 sm:w-36 sm:flex-col sm:items-start sm:gap-0">
                    <span className="font-display text-6xl leading-none text-ember">
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
                    <h3 className="text-2xl text-bone sm:text-4xl">
                      {show.venue}
                    </h3>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-smoke">
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
                        className="inline-flex items-center gap-2 rounded-full border border-edge px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-bone transition-colors duration-200 hover:border-ember hover:bg-ember hover:text-ink"
                      >
                        Tickets
                        <ArrowUpRight className="text-base" />
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
      </div>
    </section>
  );
}
