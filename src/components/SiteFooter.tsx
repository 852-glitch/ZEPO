import Link from "next/link";
import { siteConfig } from "@/config/site";

// Links first, then a giant faint wordmark that the page bottom crops.
export function SiteFooter() {
  const linkedinUrl = siteConfig.linkedinUrl;

  return (
    <footer className="footer on-dark">
      <div className="container">
        <div className="footer-row">
          <nav aria-label="קישורים משפטיים וקשר">
            <ul className="footer-links">
              <li>
                <Link href="/legal/privacy">מדיניות פרטיות</Link>
              </li>
              <li>
                <Link href="/legal/affiliate">גילוי נאות על שותפים</Link>
              </li>
              <li>
                <Link href="/legal/terms">תנאי שימוש</Link>
              </li>
              {linkedinUrl && (
                <li>
                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                    לינקדאין
                  </a>
                </li>
              )}
            </ul>
          </nav>
          <p className="footer-copy">© {siteConfig.name}</p>
        </div>
      </div>
      <p className="footer-mark" aria-hidden="true">
        {siteConfig.name}
      </p>
    </footer>
  );
}
