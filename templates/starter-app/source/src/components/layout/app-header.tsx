import Link from "next/link";

import { AppHeaderNav } from "@/components/layout/app-header-nav";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { UserMenuButton } from "@/components/layout/user-menu-button";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/75 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
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
