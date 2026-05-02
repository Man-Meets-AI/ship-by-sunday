import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function HomePageSecondaryLink({
	href,
	label,
	className,
}: {
	readonly href: string;
	readonly label: string;
	readonly className?: string;
}) {
	return (
		<Link
			href={href}
			className={cn(
				"group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border/60 px-5 text-sm font-medium text-foreground/80 transition-[border-color,color] duration-200 ease-out hover:border-foreground/20 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 motion-safe:transition-[border-color,color,transform] motion-safe:hover:-translate-y-0.5",
				className,
			)}
		>
			<span>{label}</span>
			<ArrowUpRight className="size-4 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:rotate-12" />
		</Link>
	);
}
