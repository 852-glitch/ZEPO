"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "products", label: "המוצרים", num: "01" },
  { id: "disclosure", label: "גילוי נאות", num: "02" },
  { id: "contact", label: "יצירת קשר", num: "03" },
];

// Sticky numbered section bar. An IntersectionObserver marks the section in view with
// aria-current, and the stylesheet draws the underline from that attribute. It only reads scroll
// position; it never moves the page, and links are ordinary in-page anchors.
export function SectionNav() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            setActive(id);
          } else {
            setActive((current) => (current === id ? null : current));
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const { id } of SECTIONS) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sectionbar" aria-label="ניווט בעמוד">
      <div className="container sectionbar-inner">
        {SECTIONS.map(({ id, label, num }) => (
          <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined}>
            <span className="num" aria-hidden="true">
              {num}
            </span>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
