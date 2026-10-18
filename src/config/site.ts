// Central site settings. The LinkedIn URL is public contact information, not a secret.
// Only an https LinkedIn address is accepted. NEXT_PUBLIC_LINKEDIN_URL may override the default.
const DEFAULT_LINKEDIN_URL = "https://www.linkedin.com/in/ron-perez-799641155";
const linkedinInput = process.env.NEXT_PUBLIC_LINKEDIN_URL || DEFAULT_LINKEDIN_URL;

export const siteConfig = {
  // Temporary text-based name. Replace it when the final name is chosen.
  name: "מוצרי AI",
  linkedinUrl: linkedinInput.startsWith("https://www.linkedin.com/") ? linkedinInput : "",
};
