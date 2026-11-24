"use client";

import { useEffect, useRef, useState } from "react";

interface ScriptWidgetProps {
  src: string;
  label: string;
  minHeight: number;
}

/**
 * Mounts a third-party widget script inside its own container.
 *
 * Widgets such as Travelpayouts render right before their `<script>` element
 * (they look it up via `document.currentScript`), so injecting the script here
 * keeps the widget inside this block instead of at the end of `<body>`.
 * The script is loaded only when the block approaches the viewport. If it fails
 * (e.g. blocked by an ad blocker), the whole block is hidden.
 */
export function ScriptWidget({ src, label, minHeight }: ScriptWidgetProps) {
  const rootRef = useRef<HTMLElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!visible || !mount) return;

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.charset = "utf-8";
    script.onerror = () => setFailed(true);
    mount.appendChild(script);

    // Remove the widget on unmount or src change, so client-side navigation doesn't stack copies.
    return () => mount.replaceChildren();
  }, [visible, src]);

  if (failed) return null;

  return (
    <aside ref={rootRef} aria-label={label} className="not-prose my-10">
      <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <div
        ref={mountRef}
        className="overflow-hidden rounded-lg border border-border bg-card"
        style={minHeight ? { minHeight } : undefined}
      />
    </aside>
  );
}
