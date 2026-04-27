export function WorkbenchMediaLayout({
	media,
	children,
}: {
	media: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(300px,0.88fr)_minmax(0,1.12fr)] xl:items-start">
			<div className="min-w-0 xl:sticky xl:top-0 xl:z-1 xl:self-start">
				{media}
			</div>
			<div className="min-w-0">{children}</div>
		</div>
	);
}
