import type { ReactNode } from "react";

import { IdentityLayoutHeader } from "@/features/auth/identity/identity-layout-header";

export default function IdentityLayout({ children }: { children: ReactNode }) {
	return (
		<main className="relative min-h-screen bg-background text-foreground">
			<IdentityLayoutHeader />
			<div className="flex min-h-screen items-center justify-center px-4 pb-10 pt-20 sm:px-6 lg:px-8">
				{children}
			</div>
		</main>
	);
}
