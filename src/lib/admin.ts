import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

// Every admin page and server action calls this. Neither the layout nor the proxy is trusted alone.
// getUser() validates the session with the auth server, unlike getSession().
// is_admin() is the same check the database policies use.
export async function requireAdmin() {
  const supabase = await createServerSupabase();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || isAdmin !== true) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return { supabase, userId: userData.user.id };
}
