"use client";

import type { MouseEvent, ReactNode } from "react";
import { shouldCount, type KeyValueStore } from "@/lib/click-dedupe";

// Outbound product link. The navigation is never prevented: /go/[slug] redirects whether or not
// the count is sent. The count is a separate, fire-and-forget POST, sent with keepalive so it can
// finish after the page navigates away. Modifier keys and non-primary buttons keep the browser's
// normal behavior.
export function CountedLink({ slug, className, children }: { slug: string; className?: string; children: ReactNode }) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0) return;
    if (!shouldCount(slug, readStore(), Date.now())) return;

    fetch("/api/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => undefined);
  }

  return (
    <a className={className} href={`/go/${slug}`} rel="sponsored noopener noreferrer" onClick={onClick}>
      {children}
    </a>
  );
}

// window.localStorage can throw (blocked storage, private mode). Treat that as "no storage".
function readStore(): KeyValueStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
