import type { ReactNode } from "react";

import { PublicAuthControls } from "@/components/layout/public-auth-controls";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";

const marketingLinks = [
  { label: "Features", href: "#features" },
  { label: "Why Northstar", href: "#why-northstar" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-4 focus:z-50 focus:rounded-full focus:bg-zinc-950 focus:px-4 focus:py-2 focus:text-sm focus:text-white dark:focus:bg-white dark:focus:text-zinc-950"
      >
        Skip to content
      </a>
      <PublicHeader links={marketingLinks} actions={<PublicAuthControls />} />
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
