"use client";

import { useFormStatus } from "react-dom";

type Props = {
  label: string;
  // Sent with the form as the clicked button's value, so the action knows the intent.
  name?: string;
  value?: string;
  variant?: "primary" | "secondary";
};

// Disables the buttons while the form is pending, so a double click can't submit twice.
export function SubmitButton({ label, name, value, variant = "primary" }: Props) {
  const { pending } = useFormStatus();
  const className = variant === "secondary" ? "button button-secondary" : "button";
  return (
    <button className={className} type="submit" name={name} value={value} disabled={pending} aria-disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}
