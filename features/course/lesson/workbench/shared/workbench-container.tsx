import { cn } from "@/lib/utils";

type WorkbenchContainerProps = {
	children: React.ReactNode;
	className?: string;
};

export function WorkbenchContainer({
	children,
	className,
}: WorkbenchContainerProps) {
	return (
		<div className={cn("w-full space-y-4 pb-1", className)}>{children}</div>
	);
}
