"use client";

import { useState, useRef, useEffect } from "react";

export function CodeBlockWrapper({ children, ...props }: React.ComponentPropsWithoutRef<"figure">) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const handleCopy = () => {
    const code = ref.current?.querySelector("pre")?.textContent ?? "";
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <figure ref={ref} className="group relative" {...props}>
      {children}
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-md bg-muted/80 px-2 py-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
        aria-label="Copy code"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </figure>
  );
}
