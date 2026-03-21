import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { productConfig, routeConfig } from "@/config/product";

export default function IdentityLayout({ children }: { children: ReactNode }) {
	return (
		<main className="relative min-h-screen bg-background text-foreground">
			<header className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-4 sm:px-6">
				<p className="text-sm font-medium tracking-tight">
					{productConfig.name}
				</p>
				<Button variant="link" size="sm" className="h-auto px-0" asChild>
					<Link href={routeConfig.home}>Home</Link>
				</Button>
			</header>
			<div className="flex min-h-screen items-center justify-center px-4 pb-10 pt-20 sm:px-6">
				{children}
			</div>
		</main>
	);
}
