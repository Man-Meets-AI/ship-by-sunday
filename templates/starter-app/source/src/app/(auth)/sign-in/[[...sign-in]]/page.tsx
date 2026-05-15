import { SignIn } from "@clerk/nextjs";

import { AuthShell } from "@/components/layout/auth-shell";

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Northstar access"
      title="Welcome back"
      description="Sign in to reopen your workspace, check billing details, and keep your team working from the same current context."
      points={[
        "Secure workspace access",
        "Billing and plan controls",
        "Shared team context",
      ]}
      secondaryLink={{ href: "/", label: "Back to home" }}
    >
      <SignIn />
    </AuthShell>
  );
}
