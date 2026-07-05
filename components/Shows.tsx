import { shows } from "@/data/shows";
import { socials } from "@/data/site";
import { formatShowDate, isUpcoming } from "@/lib/utils";
import { Reveal } from "@/components/Reveal";
import { ArrowUpRight, PinIcon } from "@/components/icons";

export function Shows() {
  const upcoming = shows
    .filter((s) => isUpcoming(s.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section id="shows" className="scroll-mt-20 py-14 sm:py-16">
      <div className="mx-auto w-full max-w-3xl px-6">
        <Reveal>
          <h2 className="border-t border-edge pt-10 text-4xl text-bone sm:text-5xl">
            Shows
          </h2>
        </Reveal>

        {upcoming.length > 0 ? (
          <ul className="mt-8">
            {upcoming.map((show, i) => {
              const d = formatShowDate(show.date);
              return (
                <Reveal
                  as="li"
                  key={show.id}
                  delay={i * 90}
                  className="flex flex-col gap-3 border-b border-edge/70 py-5 sm:flex-row sm:items-center sm:gap-6"
                >
                  {/* Date, ticket-stub style */}
                  <div className="flex shrink-0 items-baseline gap-2 sm:w-28 sm:flex-col sm:gap-0">
                    <span className="font-display text-4xl leading-none text-ember">
                      {d.day}
                    </span>
                    <span className="font-display text-xl leading-none text-bone">
                      {d.month}
                    </span>
                    <span className="text-xs text-smoke sm:mt-1">
                      {d.weekday} / {d.year}
                    </span>
                  </div>

                  {/* Venue */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl text-bone sm:text-2xl">
                      {show.venue}
                    </h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-smoke">
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
                  <div className="shrink-0">
                    {show.ticketUrl ? (
                      <a
                        href={show.ticketUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-2 rounded-full border border-edge px-4 py-2 text-xs font-semibold uppercase tracking-wider text-bone transition-colors duration-200 hover:border-ember hover:bg-ember hover:text-ink"
                      >
                        Tickets
                        <ArrowUpRight className="text-sm" />
                        <span className="sr-only">for {show.venue}</span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-edge px-4 py-2 text-xs font-semibold uppercase tracking-wider text-smoke">
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
            <div className="mt-8 border-b border-edge/70 py-8">
              <p className="font-display text-2xl uppercase text-bone">
                No upcoming shows
              </p>
              <a
                href={socials.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-edge px-4 py-2 text-xs font-semibold uppercase tracking-wider text-bone transition-colors hover:border-ember hover:bg-ember hover:text-ink"
              >
                Follow on Instagram
                <ArrowUpRight className="text-sm" />
              </a>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
