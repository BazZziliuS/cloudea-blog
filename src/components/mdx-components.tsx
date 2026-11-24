"use client";

import React, { type ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ZoomableImage } from "@/components/zoomable-image";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

function CopyButton({ text }: { text: string }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className="absolute right-2 top-2 rounded-md bg-muted/80 px-2 py-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
      aria-label="Скопировать код"
    >
      {copied ? "Скопировано" : "Копировать"}
    </button>
  );
}

function Pre({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const textContent = extractText(children);
  const language = (props as Record<string, unknown>)["data-language"];

  return (
    <div className="group relative">
      {typeof language === "string" && language !== "plaintext" && (
        <span className="pointer-events-none absolute left-3 top-2 select-none font-mono text-xs text-neutral-400">
          {language}
        </span>
      )}
      <pre
        className={`overflow-x-auto rounded-lg border border-border bg-[#24292e] p-4 text-sm leading-relaxed ${typeof language === "string" && language !== "plaintext" ? "pt-7" : ""}`}
        {...props}
      >
        {children}
      </pre>
      <CopyButton text={textContent} />
    </div>
  );
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    return extractText(el.props.children);
  }
  return "";
}

export const mdxComponents: Record<string, React.ComponentType<Record<string, unknown>>> = {
  h1: (props) => (
    <h1
      className="mt-10 scroll-m-20 text-4xl font-bold tracking-tight"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mt-10 scroll-m-20 border-b border-border pb-2 text-3xl font-semibold tracking-tight first:mt-0"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight"
      {...props}
    />
  ),
  h4: (props) => (
    <h4
      className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight"
      {...props}
    />
  ),
  p: (props) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
  ),
  a: (props) => {
    const href = (props.href as string) ?? "#";
    // In-page anchors (including heading links) must not open a new tab.
    if (href.startsWith("#")) {
      return <a className="font-medium text-primary underline underline-offset-4" {...props} />;
    }
    if (href.startsWith("/")) {
      return (
        <Link
          href={href}
          className="font-medium text-primary underline underline-offset-4"
          {...props}
        />
      );
    }
    return (
      <a
        className="font-medium text-primary underline underline-offset-4"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    );
  },
  ul: (props) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />,
  ol: (props) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
  ),
  li: (props) => <li className="leading-7" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-6 border-l-4 border-primary pl-6 italic text-muted-foreground"
      {...props}
    />
  ),
  table: (props) => (
    <div className="my-6 w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props) => (
    <th
      className="border border-border px-4 py-2 text-left font-semibold"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border border-border px-4 py-2" {...props} />
  ),
  tr: (props) => (
    <tr className="even:bg-muted/50" {...props} />
  ),
  img: (props) => {
    const src = typeof props.src === "string" ? props.src : "";
    const alt = typeof props.alt === "string" ? props.alt : "";

    // Co-located content assets are optimized by next/image.
    if (src.startsWith("/api/content/")) {
      return (
        <ZoomableImage src={src} alt={alt}>
          <Image
          src={src}
          alt={alt}
          width={800}
          height={450}
          className="rounded-lg"
          sizes="(max-width: 768px) 100vw, 800px"
        />
        </ZoomableImage>
      );
    }

    // Badges (shields.io) render inline; other external images are loaded as-is
    // so arbitrary hosts don't need to be allow-listed in next.config.ts.
    if (src.includes("shields.io")) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={alt} loading="lazy" decoding="async" />;
    }
    return <ZoomableImage src={src} alt={alt} />;
  },
  hr: (props) => <hr className="my-8 border-border" {...props} />,
  pre: Pre as React.ComponentType<Record<string, unknown>>,
  code: (props) => {
    const p = props as Record<string, unknown>;
    // Code block inside <pre> (has data-language from rehype-pretty-code)
    if (p["data-language"]) {
      return <code {...props} />;
    }
    // Inline code (plain or rehype-pretty-code inline)
    return (
      <code
        className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm"
        {...props}
      />
    );
  },
};
