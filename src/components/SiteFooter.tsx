import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const linkedinUrl = siteConfig.linkedinUrl;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <p className="footer-brand">{siteConfig.name}</p>
            <p className="footer-note">מבחר מצומצם של מוצרי AI, עם הסבר על השימושים והמגבלות של כל אחד.</p>
          </div>

          <nav aria-label="קישורים משפטיים">
            <p className="footer-title">מידע משפטי</p>
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
            </ul>
          </nav>

          <div>
            <p className="footer-title">יצירת קשר</p>
            <ul className="footer-links">
              <li>
                <Link href="/#contact">להצעת מוצר</Link>
              </li>
              {linkedinUrl && (
                <li>
                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                    לינקדאין
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <p className="footer-legal">© {siteConfig.name}</p>
      </div>
    </footer>
  );
}
