import type { ReactNode } from "react";

import { IdentityLayoutHeader } from "@/app/(identity)/_components/identity-layout-header";

export function IdentityPageFrame({ children }: { children: ReactNode }) {
	return (
		<main className="relative min-h-screen bg-background text-foreground tracking-normal">
			<IdentityLayoutHeader />
			<div className="flex min-h-screen items-center pb-10 pt-20">
				<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
					{children}
				</div>
			</div>
		</main>
	);
}
