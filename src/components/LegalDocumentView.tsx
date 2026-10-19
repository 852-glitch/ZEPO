import type { LegalDocument } from "@/content/legal";

// Renders a legal draft as plain text. The draft notice stays visible until a lawyer has reviewed it.
export function LegalDocumentView({ document }: { document: LegalDocument }) {
  return (
    <main className="container legal page">
      <p className="draft-notice" role="note">
        טיוטה — טרם נבדקה על ידי עורך דין. אין לראות במסמך זה ייעוץ משפטי.
      </p>
      <h1>{document.title}</h1>
      <p className="field-hint">{document.updated}</p>
      {document.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
      ))}
    </main>
  );
}
