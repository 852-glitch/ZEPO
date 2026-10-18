"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "@/admin/actions";
import { SubmitButton } from "@/admin/SubmitButton";

const initialState: LoginState = { email: "" };

export function LoginForm() {
  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="admin-form login-form">
      <label>
        Email
        <input name="email" type="email" autoComplete="username" required defaultValue={state.email} />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.message && (
        <p className="admin-message admin-message-error" role="alert">
          {state.message}
        </p>
      )}
      <SubmitButton label="Sign in" />
    </form>
  );
}
