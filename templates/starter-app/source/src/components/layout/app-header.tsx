import Link from "next/link";

import { AppHeaderNav } from "@/components/layout/app-header-nav";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { UserMenuButton } from "@/components/layout/user-menu-button";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <BrandLockup href="/dashboard" />
          <AppHeaderNav />
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/">Back to marketing</Link>
          </Button>
          <UserMenuButton />
        </div>
      </div>
    </header>
  );
}
