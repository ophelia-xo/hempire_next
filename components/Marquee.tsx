const phrases = [
  "The Weight out now",
  "High Country Hash Thrash",
  "Live in Asheville",
];

/**
 * Seamless infinite marquee. The phrases are repeated enough to overflow the
 * widest viewport, then the whole run is rendered twice. The track animates by
 * exactly -50% (one run width), so copy two lands where copy one started and
 * the loop never shows a gap. Hidden from assistive tech.
 */
export function Marquee() {
  const run = Array.from({ length: 5 }, () => phrases).flat();

  return (
    <div
      aria-hidden
      className="overflow-hidden border-y border-edge bg-coal py-4 select-none"
    >
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {run.map((text, i) => (
              <span key={`${copy}-${i}`} className="flex items-center">
                <span className="px-6 font-display text-xl uppercase tracking-wide text-smoke sm:text-2xl">
                  {text}
                </span>
                <span className="text-ember">&#9733;</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
