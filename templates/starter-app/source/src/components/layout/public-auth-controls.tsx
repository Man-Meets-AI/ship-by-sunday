import Link from "next/link";

import { UserMenuButton } from "@/components/layout/user-menu-button";
import { Button } from "@/components/ui/button";
import { getViewerAuthSubject } from "@/lib/auth/clerk";

export async function PublicAuthControls() {
  const viewerAuthSubject = await getViewerAuthSubject();

  if (viewerAuthSubject) {
    return (
      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
        <Button asChild className="h-9 px-3.5 sm:h-10 sm:px-4">
          <Link href="/dashboard">Open app</Link>
        </Button>
        <div className="shrink-0">
          <UserMenuButton />
        </div>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:justify-end">
      <Button asChild variant="ghost" className="h-9 px-3 sm:h-10 sm:px-4">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild className="h-9 px-3.5 sm:h-10 sm:px-4">
        <Link href="/sign-up">Get started</Link>
      </Button>
    </div>
  );
}
