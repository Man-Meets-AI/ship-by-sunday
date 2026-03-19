export function WorkbenchMediaLayout({
	media,
	children,
}: {
	media: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(300px,0.88fr)_minmax(0,1.12fr)] xl:items-start">
			<div className="min-w-0">{media}</div>
			<div className="min-w-0">{children}</div>
		</div>
	);
}
