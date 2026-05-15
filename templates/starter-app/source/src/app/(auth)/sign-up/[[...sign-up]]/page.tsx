import { SignUp } from "@clerk/nextjs";

import { AuthShell } from "@/components/layout/auth-shell";

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="Set up Northstar"
      title="Create your workspace"
      description="Start with a clean workspace for your team so work, customer updates, and billing visibility all live in one place from day one."
      points={[
        "Invite your team",
        "Track work and updates",
        "Manage plans in one place",
      ]}
      secondaryLink={{ href: "/#pricing", label: "View pricing" }}
    >
      <SignUp />
    </AuthShell>
  );
}
