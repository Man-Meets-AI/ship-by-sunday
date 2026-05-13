import type { ReactNode } from "react";

import { PublicAuthControls } from "@/components/layout/public-auth-controls";
import { PublicHeader } from "@/components/layout/public-header";

const authLinks = [
  { label: "Features", href: "/#features" },
  { label: "Why Northstar", href: "/#why-northstar" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-4 focus:z-50 focus:rounded-full focus:bg-zinc-950 focus:px-4 focus:py-2 focus:text-sm focus:text-white dark:focus:bg-white dark:focus:text-zinc-950"
      >
        Skip to content
      </a>
      <PublicHeader links={authLinks} actions={<PublicAuthControls />} />
      {children}
    </div>
  );
}
