import type { Metadata } from "next";
import { connection } from "next/server";
import { LegalDocumentView } from "@/components/LegalDocumentView";
import { TERMS } from "@/content/legal";

export const metadata: Metadata = { title: TERMS.title };

export default async function Page() {
  await connection();
  return <LegalDocumentView document={TERMS} />;
}
