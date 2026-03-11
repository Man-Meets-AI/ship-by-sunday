export type ProductTheme = "dark" | "light";

export const DEFAULT_PRODUCT_THEME: ProductTheme = "dark";
export const PRODUCT_THEME_STORAGE_KEY = "sbs:theme";
export const PRODUCT_THEME_COOKIE_NAME = "sbs-theme";

export function isProductTheme(value: unknown): value is ProductTheme {
	return value === "dark" || value === "light";
}

export function getProductThemeBootstrapScript() {
	return `
		(function () {
			var fallback = ${JSON.stringify(DEFAULT_PRODUCT_THEME)};
			var storageKey = ${JSON.stringify(PRODUCT_THEME_STORAGE_KEY)};
			var cookieName = ${JSON.stringify(PRODUCT_THEME_COOKIE_NAME)};
			var theme = fallback;

			try {
				var storedTheme = window.localStorage.getItem(storageKey);
				if (storedTheme === "dark" || storedTheme === "light") {
					theme = storedTheme;
				}
			} catch (_) {}

			document.documentElement.dataset.productTheme = theme;
			document.cookie =
				cookieName +
				"=" +
				theme +
				"; path=/; max-age=31536000; SameSite=Lax";
		})();
	`;
}
