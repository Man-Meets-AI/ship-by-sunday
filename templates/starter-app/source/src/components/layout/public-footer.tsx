import Link from "next/link";
import { BrandLockup } from "@/components/layout/brand-lockup";

const sectionLinks = [
  { label: "Features", href: "#features" },
  { label: "Why it works", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
];

const authLinks = [
  { label: "Sign in", href: "/sign-in" },
  { label: "Get started", href: "/sign-up" },
];

export function PublicFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="grid w-full gap-10 px-6 py-12 sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_repeat(2,minmax(0,220px))] lg:px-12 xl:px-16 2xl:px-20">
        <div className="space-y-4">
          <BrandLockup href="/" />
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            Northstar helps small teams keep work, billing visibility, and
            customer updates in one calm workspace.
          </p>
          <p className="text-sm text-muted-foreground">
            Built from the generated starter source.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold text-muted-foreground">
            Sections
          </p>
          <nav aria-label="Footer sections" className="flex flex-col gap-3">
            {sectionLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold text-muted-foreground">
            Access
          </p>
          <nav aria-label="Footer access" className="flex flex-col gap-3">
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
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
