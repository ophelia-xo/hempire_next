import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";
type Size = "md" | "lg";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  external?: boolean;
  className?: string;
  "aria-label"?: string;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-ember text-ink hover:bg-ember-bright border border-ember hover:border-ember-bright",
  outline:
    "border border-edge text-bone hover:border-bone hover:bg-bone/5",
  ghost: "text-bone hover:text-ember",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

/** Primary call-to-action, rendered as a link. */
export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  external = false,
  className,
  ...rest
}: ButtonLinkProps) {
  const externalProps = external
    ? { target: "_blank", rel: "noreferrer noopener" }
    : {};

  return (
    <a
      href={href}
      {...externalProps}
      {...rest}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-wider",
        "transition-[background-color,border-color,color,transform] duration-200 ease-out active:translate-y-px",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </a>
  );
}
