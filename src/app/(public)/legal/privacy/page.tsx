import type { Metadata } from "next";
import { connection } from "next/server";
import { LegalDocumentView } from "@/components/LegalDocumentView";
import { PRIVACY } from "@/content/legal";

export const metadata: Metadata = { title: PRIVACY.title };

export default async function Page() {
  await connection();
  return <LegalDocumentView document={PRIVACY} />;
}
