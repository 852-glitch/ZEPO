import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <nav aria-label="קישורים משפטיים">
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
        <p>© {siteConfig.name}</p>
      </div>
    </footer>
  );
}
