import type { ElementType, ReactNode } from "react";

import { workbenchChromeLabelClass } from "./workbench-readability";

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
					? `${workbenchChromeLabelClass} ${className}`
					: workbenchChromeLabelClass
			}
		>
			{children}
		</Component>
	);
}
