import type { Metadata } from "next";
import { connection } from "next/server";
import { LegalDocumentView } from "@/components/LegalDocumentView";
import { ACCESSIBILITY_STATEMENT } from "@/content/legal";

export const metadata: Metadata = { title: ACCESSIBILITY_STATEMENT.title };

export default async function Page() {
  await connection();
  return <LegalDocumentView document={ACCESSIBILITY_STATEMENT} />;
}
