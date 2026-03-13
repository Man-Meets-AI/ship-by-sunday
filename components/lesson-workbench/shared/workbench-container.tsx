type WorkbenchContainerProps = {
	children: React.ReactNode;
	className?: string;
	maxWidthClassName?: string;
};

export function WorkbenchContainer({
	children,
	className,
	maxWidthClassName = "max-w-[58rem]",
}: WorkbenchContainerProps) {
	return (
		<div
			className={`mx-auto ${maxWidthClassName} space-y-5 ${className ?? ""}`.trim()}
		>
			{children}
		</div>
	);
}
