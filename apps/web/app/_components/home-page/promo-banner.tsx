import { cn } from "@/lib/utils";

type PromoBannerProps = {
	readonly label: string;
	readonly message: string;
	readonly className?: string;
	readonly contentClassName?: string;
	readonly labelClassName?: string;
	readonly messageClassName?: string;
};

export function PromoBanner({
	label,
	message,
	className,
	contentClassName,
	labelClassName,
	messageClassName,
}: PromoBannerProps) {
	return (
		<div className={className}>
			<p
				className={cn(
					"flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium tracking-[0.14em] text-foreground/90 uppercase sm:text-xs",
					contentClassName,
				)}
			>
				<span
					className={cn(
						"rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-background sm:text-[11px]",
						labelClassName,
					)}
				>
					{label}
				</span>
				<span className={messageClassName}>{message}</span>
			</p>
		</div>
	);
}
