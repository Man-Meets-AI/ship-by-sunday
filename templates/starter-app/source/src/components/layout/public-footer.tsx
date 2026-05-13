import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { BrandLockup } from "@/components/layout/brand-lockup";
import { templateRepoUrl } from "@/lib/app/links";

const sectionLinks = [
  { label: "Features", href: "#features" },
  { label: "Why Northstar", href: "#why-northstar" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const authLinks = [
  { label: "Sign in", href: "/sign-in" },
  { label: "Get started", href: "/sign-up" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-zinc-200/70 bg-white/60 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="grid w-full gap-10 px-6 py-12 sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_repeat(2,minmax(0,220px))] lg:px-12 xl:px-16 2xl:px-20">
        <div className="space-y-4">
          <BrandLockup href="/" />
          <p className="max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Northstar helps small teams keep work, billing visibility, and
            customer updates in one calm workspace.
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Built from the open-source starter.{" "}
            <a
              href={templateRepoUrl}
              rel="noreferrer"
              target="_blank"
              className="inline-flex items-center gap-1 font-medium text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              GitHub
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Sections
          </p>
          <nav aria-label="Footer sections" className="flex flex-col gap-3">
            {sectionLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md text-sm text-zinc-600 transition-colors hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 focus-visible:outline-none dark:text-zinc-300 dark:hover:text-zinc-50 dark:focus-visible:ring-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Access
          </p>
          <nav aria-label="Footer access" className="flex flex-col gap-3">
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md text-sm text-zinc-600 transition-colors hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 focus-visible:outline-none dark:text-zinc-300 dark:hover:text-zinc-50 dark:focus-visible:ring-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
