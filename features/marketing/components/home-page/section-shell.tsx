import type { ReactNode } from "react";

import { PublicSurfaceCard } from "@/shared/ui/public-surface";

export function SectionFrame({
	children,
	className = "",
	id,
}: {
	children: ReactNode;
	className?: string;
	id?: string;
}) {
	return (
		<PublicSurfaceCard
			id={id}
			className={`px-5 py-6 sm:px-8 sm:py-8 ${className}`}
		>
			{children}
		</PublicSurfaceCard>
	);
}

export function SectionLabel({ children }: { children: ReactNode }) {
	return (
		<p className="font-sans text-xs font-bold uppercase tracking-[0.24em] text-product-muted">
			{children}
		</p>
	);
}
