import type { Metadata } from "next";
import { connection } from "next/server";
import { LegalDocumentView } from "@/components/LegalDocumentView";
import { AFFILIATE_DISCLOSURE } from "@/content/legal";

export const metadata: Metadata = { title: AFFILIATE_DISCLOSURE.title };

export default async function Page() {
  await connection();
  return <LegalDocumentView document={AFFILIATE_DISCLOSURE} />;
}
