"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "products", label: "המוצרים" },
  { id: "disclosure", label: "גילוי נאות" },
  { id: "contact", label: "יצירת קשר" },
];

// Side indicator that shows which section is in view. It only reads scroll position through an
// IntersectionObserver; it never changes the page. Hidden on small screens by the stylesheet.
export function SectionDots() {
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
    <nav className="section-dots" aria-label="סעיפי הדף">
      {SECTIONS.map(({ id, label }) => (
        <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined}>
          {label}
        </a>
      ))}
    </nav>
  );
}
