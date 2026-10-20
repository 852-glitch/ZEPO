"use client";

import type { ReactNode } from "react";
import { AccessibilityProvider, AccessibilityToolbar } from "@multicloud-io/react-a11y-toolbar";
import { accessibilityHe } from "@/config/accessibility-he";

// The toolbar uses React context and hooks, so it must run in a client component.
// The public layout is a server component and renders this wrapper around the page.
export function AccessibilityShell({ children }: { children: ReactNode }) {
  return (
    <AccessibilityProvider>
      {children}
      <AccessibilityToolbar locale="he" translations={accessibilityHe} />
    </AccessibilityProvider>
  );
}
