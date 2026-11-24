"use client";

import { useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useMounted } from "@/hooks/use-mounted";

interface ZoomableImageProps {
  src: string;
  alt: string;
  /** Custom thumbnail (e.g. next/image). Defaults to a lazy-loaded <img>. */
  children?: ReactNode;
}

/** Image that opens full-size in a modal dialog on click. Esc or a click anywhere closes it. */
export function ZoomableImage({ src, alt, children }: ZoomableImageProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Markdown images sit inside <p>, where <dialog> is not allowed: render it in <body>.
  const mounted = useMounted();

  const dialog = (
    <dialog
      ref={dialogRef}
      onClick={() => dialogRef.current?.close()}
      className="m-auto max-h-[95vh] max-w-[95vw] cursor-zoom-out bg-transparent p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="max-h-[95vh] max-w-[95vw] rounded-lg object-contain" />
    </dialog>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="block w-full cursor-zoom-in rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={alt || undefined}
      >
        {children ?? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} loading="lazy" decoding="async" className="rounded-lg" />
        )}
      </button>
      {mounted && createPortal(dialog, document.body)}
    </>
  );
}
