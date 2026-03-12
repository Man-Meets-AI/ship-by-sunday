export function WorkbenchContainer({
	children,
}: {
	children: React.ReactNode;
}) {
	return <div className="mx-auto max-w-4xl space-y-4">{children}</div>;
}
