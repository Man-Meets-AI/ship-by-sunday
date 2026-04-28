type BlogPostShareRailProps = {
	postPath: string;
};

export function BlogPostShareRail({ postPath }: BlogPostShareRailProps) {
	return (
		<aside className="hidden text-sm text-foreground/60 lg:block">
			<div className="sticky top-8 border-t border-border pt-4">
				<p className="font-medium text-foreground">Share</p>
				<a
					href={postPath}
					className="mt-4 inline-block transition-colors hover:text-foreground"
				>
					Permalink
				</a>
			</div>
		</aside>
	);
}
