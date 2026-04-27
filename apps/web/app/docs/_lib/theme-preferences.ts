export type DocsTheme = "dark" | "light";

export const DOCS_THEME_STORAGE_KEY = "docs:theme";
export const DOCS_THEME_COOKIE_NAME = "docs-theme";
const DOCS_THEME_COOKIE_MAX_AGE_SECONDS = 31_536_000;

export function isDocsTheme(value: unknown): value is DocsTheme {
	return value === "dark" || value === "light";
}

export function getDocsThemeCookieString(theme: DocsTheme) {
	return `${DOCS_THEME_COOKIE_NAME}=${theme}; path=/; max-age=${DOCS_THEME_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}
