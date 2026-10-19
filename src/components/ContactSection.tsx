import { siteConfig } from "@/config/site";

// Product-owner contact. It links to LinkedIn only. It is not a submission form, and it does not
// promise that a product will be listed. Listing is our decision, and we may find products
// ourselves without any contact from their owners.
export function ContactSection() {
  const url = siteConfig.linkedinUrl;

  return (
    <section className="contact-band on-dark" id="contact" aria-labelledby="contact-heading">
      <div className="container">
        <p className="eyebrow">יצירת קשר</p>
        <h2 id="contact-heading">פיתחתם מוצר AI?</h2>
        <p>שלחו לנו הודעה בלינקדאין. פנייה אינה מבטיחה פרסום; ההחלטה על פרסום מוצר נתונה בידינו.</p>
        {url ? (
          <a className="button linkedin-button" href={url} target="_blank" rel="noopener noreferrer">
            <LinkedInIcon />
            שלחו הודעה בלינקדאין
          </a>
        ) : (
          <span className="button control-disabled" aria-disabled="true">
            קישור לינקדאין יתווסף בקרוב
          </span>
        )}
      </div>
    </section>
  );
}

// Simple LinkedIn mark drawn with shapes. It is decorative, so the text next to it carries the meaning.
function LinkedInIcon() {
  return (
    <svg className="linkedin-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="22" height="22" rx="3" fill="currentColor" />
      <circle cx="6.5" cy="6.5" r="1.8" fill="var(--color-accent, #c2310f)" />
      <rect x="4.9" y="9.5" width="3.2" height="9.5" fill="var(--color-accent, #c2310f)" />
      <path
        d="M10.3 9.5h3v1.3c.5-.9 1.6-1.5 2.9-1.5 2.6 0 3.2 1.7 3.2 3.9v5.8h-3.2v-5.1c0-1.2 0-2.7-1.7-2.7s-1.9 1.3-1.9 2.6v5.2h-3.2z"
        fill="var(--color-accent, #c2310f)"
      />
    </svg>
  );
}
