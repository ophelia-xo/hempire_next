"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CopyIcon, CheckIcon } from "@/components/icons";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Legacy fallback for browsers that block the async clipboard API.
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * Inline copy-to-clipboard email link for use mid-sentence. Same behavior as
 * CopyEmail, sized to flow with the surrounding text.
 */
export function CopyEmailInline({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(email);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy booking email ${email} to clipboard`}
      className={cn(
        "inline-flex items-center gap-1.5 align-baseline font-semibold transition-colors",
        copied
          ? "text-ember-bright"
          : "text-ember underline-offset-4 hover:underline",
      )}
    >
      {copied ? (
        <CheckIcon className="text-sm" />
      ) : (
        <CopyIcon className="text-sm" />
      )}
      <span>{copied ? "Copied to clipboard" : email}</span>
      <span aria-live="polite" className="sr-only">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </button>
  );
}

/**
 * Booking email as a copy-to-clipboard button. Keeps people on the page
 * instead of firing an external mail client, with clear "copied" feedback.
 * The address stays visible so it can always be copied by hand as a last resort.
 */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(email);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy booking email ${email} to clipboard`}
        className={cn(
          "group inline-flex items-center justify-center gap-2.5 rounded-full border px-7 py-3.5 text-base font-semibold uppercase tracking-wider",
          "transition-[background-color,border-color,color,transform] duration-200 ease-out active:translate-y-px",
          copied
            ? "border-ember bg-transparent text-ember"
            : "border-ember bg-ember text-ink hover:border-ember-bright hover:bg-ember-bright",
        )}
      >
        {copied ? (
          <CheckIcon className="text-lg" />
        ) : (
          <CopyIcon className="text-lg" />
        )}
        <span>{copied ? "Copied to clipboard" : email}</span>
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </div>
  );
}
