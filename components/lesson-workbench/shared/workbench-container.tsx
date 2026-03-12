type WorkbenchContainerProps = {
	children: React.ReactNode;
	className?: string;
};

export function WorkbenchContainer({
	children,
	className,
}: WorkbenchContainerProps) {
	return (
		<div className={`mx-auto max-w-4xl space-y-4 ${className ?? ""}`.trim()}>
			{children}
		</div>
	);
}
