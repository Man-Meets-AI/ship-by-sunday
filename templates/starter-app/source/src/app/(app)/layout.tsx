import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";

export default async function ProductAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AppHeader />
      {children}
    </div>
  );
}
