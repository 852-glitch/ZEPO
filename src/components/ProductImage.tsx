"use client";

import { useState } from "react";

const PLACEHOLDER_SRC = "/images/placeholder.svg";

type Props = {
  src: string | null;
  alt: string;
};

// Shows a neutral local placeholder when there is no image URL or the image fails to load.
// This is the only client component on the public pages, so the data code stays on the server.
export function ProductImage({ src, alt }: Props) {
  const [failed, setFailed] = useState(false);
  const shown = src && !failed ? src : PLACEHOLDER_SRC;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- plain img: remote URLs, no optimizer cost
    <img
      className="card-image"
      src={shown}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
