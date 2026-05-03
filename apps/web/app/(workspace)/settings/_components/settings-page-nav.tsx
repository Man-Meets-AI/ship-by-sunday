import { cn } from "@/lib/utils";

const tocLinkClassName =
	"text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none rounded-sm";

export function SettingsPageDesktopToc({
	starterRepoEnabled,
}: {
	starterRepoEnabled: boolean;
}) {
	return (
		<aside id="settings-toc" className="hidden shrink-0 lg:block lg:w-44">
			<nav aria-label="Settings sections" className="sticky top-24 space-y-3">
				<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					On this page
				</p>
				<ul className="flex flex-col gap-2 text-sm">
					<li>
						<a className={tocLinkClassName} href="#codex-connection">
							Codex connection
						</a>
					</li>
					{starterRepoEnabled ? (
						<li>
							<a className={tocLinkClassName} href="#starter-repo-access">
								Starter repository
							</a>
						</li>
					) : null}
					<li>
						<a className={tocLinkClassName} href="#settings-account">
							Account
						</a>
					</li>
				</ul>
			</nav>
		</aside>
	);
}

export function SettingsPageMobileJumpLinks({
	starterRepoEnabled,
}: {
	starterRepoEnabled: boolean;
}) {
	return (
		<nav
			aria-label="Jump to section"
			className="flex flex-wrap gap-x-3 gap-y-1 text-xs lg:hidden"
		>
			<span className="text-muted-foreground">Jump to:</span>
			<a
				href="#codex-connection"
				className={cn(tocLinkClassName, "underline-offset-4 hover:underline")}
			>
				Codex
			</a>
			{starterRepoEnabled ? (
				<a
					href="#starter-repo-access"
					className={cn(tocLinkClassName, "underline-offset-4 hover:underline")}
				>
					Starter repo
				</a>
			) : null}
			<a
				href="#settings-account"
				className={cn(tocLinkClassName, "underline-offset-4 hover:underline")}
			>
				Account
			</a>
		</nav>
	);
}
