const phrases = [
  "The Weight out now",
  "High Country Hash Thrash",
  "Live in Asheville",
];

function Row({
  reverse = false,
  outline = false,
}: {
  reverse?: boolean;
  outline?: boolean;
}) {
  const run = Array.from({ length: 5 }, () => phrases).flat();
  return (
    <div
      className={`flex w-max whitespace-nowrap ${
        reverse ? "animate-marquee-reverse" : "animate-marquee"
      }`}
    >
      {[0, 1].map((copy) => (
        <div key={copy} className="flex shrink-0">
          {run.map((text, i) => (
            <span key={`${copy}-${i}`} className="flex items-center">
              <span
                className={`px-6 font-display text-xl uppercase tracking-wide sm:text-2xl ${
                  outline ? "text-outline" : "text-smoke"
                }`}
              >
                {text}
              </span>
              <span className={outline ? "text-ember/40" : "text-ember"}>
                &#9733;
              </span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Two seamless marquee rows running opposite directions, one solid and one
 * outlined, like stacked gig-poster tape. Each row repeats its phrases enough
 * to overflow the widest viewport, renders the run twice, and animates by
 * exactly -50% so the loop never shows a gap. Hidden from assistive tech.
 */
export function Marquee() {
  return (
    <div
      aria-hidden
      className="select-none overflow-hidden border-y border-edge bg-coal"
    >
      <div className="py-3">
        <Row />
      </div>
      <div className="border-t border-edge/60 py-3">
        <Row reverse outline />
      </div>
    </div>
  );
}
