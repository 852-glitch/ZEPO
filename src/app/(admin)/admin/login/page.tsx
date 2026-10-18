import { LoginForm } from "@/admin/LoginForm";

// Public sign-in page. It has no registration link, and sign-ups are disabled in Supabase Auth.
export default function AdminLoginPage() {
  return (
    <section>
      <h1>Administrator sign-in</h1>
      <LoginForm />
    </section>
  );
}
