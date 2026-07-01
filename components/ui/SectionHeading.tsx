import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  kicker,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className={cn("kicker", align === "center" && "justify-center")}>
        {kicker}
      </p>
      <h2 className="display-2 mt-4 text-bone">{title}</h2>
      {description && (
        <p className="mt-5 text-base leading-relaxed text-smoke sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
