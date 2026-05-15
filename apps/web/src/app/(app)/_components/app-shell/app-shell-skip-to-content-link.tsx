export const APP_SHELL_MAIN_ID = "app-shell-main";

const skipLinkClassName =
	"sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

export function AppShellSkipToContentLink() {
	return (
		<a href={`#${APP_SHELL_MAIN_ID}`} className={skipLinkClassName}>
			Skip to content
		</a>
	);
}
