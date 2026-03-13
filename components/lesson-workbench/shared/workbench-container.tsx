type WorkbenchContainerProps = {
	children: React.ReactNode;
	className?: string;
	maxWidthClassName?: string;
};

export function WorkbenchContainer({
	children,
	className,
	maxWidthClassName = "max-w-4xl",
}: WorkbenchContainerProps) {
	return (
		<div
			className={`mx-auto ${maxWidthClassName} space-y-4 ${className ?? ""}`.trim()}
		>
			{children}
		</div>
	);
}
