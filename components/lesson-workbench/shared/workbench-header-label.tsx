import type { ElementType, ReactNode } from "react";

const workbenchHeaderLabelClass =
	"font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted";

export function WorkbenchHeaderLabel({
	as: Component = "span",
	children,
	className,
}: {
	as?: ElementType;
	children: ReactNode;
	className?: string;
}) {
	return (
		<Component
			className={
				className
					? `${workbenchHeaderLabelClass} ${className}`
					: workbenchHeaderLabelClass
			}
		>
			{children}
		</Component>
	);
}
