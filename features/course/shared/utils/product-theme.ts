import {
	brandColorConfig,
	productThemeConfig,
	productThemePalettes,
} from "@/config/product";

export type ProductTheme = "dark" | "light";

type ProductThemePalette =
	(typeof productThemePalettes)[keyof typeof productThemePalettes];

export const DEFAULT_PRODUCT_THEME: ProductTheme =
	productThemeConfig.defaultTheme;
export const PRODUCT_THEME_STORAGE_KEY = productThemeConfig.storageKey;
export const PRODUCT_THEME_COOKIE_NAME = productThemeConfig.cookieName;

function serializeCssVariables(variables: Record<string, string>) {
	return Object.entries(variables)
		.map(([key, value]) => `${key}: ${value};`)
		.join("\n");
}

function getProductThemeVariables(palette: ProductThemePalette) {
	return serializeCssVariables({
		"--product-bg": palette.bgRgb,
		"--product-surface": palette.surfaceRgb,
		"--product-surface-strong": palette.surfaceStrongRgb,
		"--product-surface-alt": palette.surfaceAltRgb,
		"--product-border": palette.borderRgb,
		"--product-text": palette.textRgb,
		"--product-muted": palette.mutedRgb,
		"--product-accent": palette.accentRgb,
		"--product-accent-soft": palette.accentSoftRgb,
		"--product-chip": palette.chipRgb,
		"--product-shadow": palette.shadowRgb,
	});
}

export function isProductTheme(value: unknown): value is ProductTheme {
	return value === "dark" || value === "light";
}

export function getProductThemeCookieString(theme: ProductTheme) {
	return `${PRODUCT_THEME_COOKIE_NAME}=${theme}; path=/; max-age=${productThemeConfig.cookieMaxAgeSeconds}; SameSite=Lax`;
}

export function getProductThemeTokenStyles() {
	return `
		:root {
			${serializeCssVariables({
				"--brand-ink": "var(--product-text)",
				"--brand-paper": "var(--product-bg)",
				"--brand-line": "var(--product-border)",
				"--brand-muted": "var(--product-muted)",
				"--brand-accent": "var(--product-accent)",
				"--brand-danger": brandColorConfig.dangerRgb,
				"--brand-danger-soft": brandColorConfig.dangerSoftRgb,
				"--product-scrollbar-size": `${productThemeConfig.scrollbarSizePx}px`,
				"--product-scrollbar-thumb": `rgb(var(--product-border) / ${productThemeConfig.scrollbarThumbAlpha})`,
				"--product-scrollbar-thumb-hover": `rgb(var(--product-border) / ${productThemeConfig.scrollbarThumbHoverAlpha})`,
				"--product-scrollbar-track": "transparent",
				"--motion-fast": `${productThemeConfig.motion.fastMs}ms`,
				"--motion-base": `${productThemeConfig.motion.baseMs}ms`,
				"--motion-slow": `${productThemeConfig.motion.slowMs}ms`,
				"--ease-standard": productThemeConfig.motion.easeStandard,
				"--ease-exit": productThemeConfig.motion.easeExit,
			})}
			${getProductThemeVariables(productThemeConfig.palettes[DEFAULT_PRODUCT_THEME])}
		}

		html[data-product-theme="dark"] {
			color-scheme: ${productThemeConfig.palettes.dark.colorScheme};
			${getProductThemeVariables(productThemeConfig.palettes.dark)}
		}

		html[data-product-theme="light"] {
			color-scheme: ${productThemeConfig.palettes.light.colorScheme};
			${getProductThemeVariables(productThemeConfig.palettes.light)}
		}
	`;
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
			document.documentElement.classList.remove("light", "dark");
			document.documentElement.classList.add(theme);
			document.cookie =
				cookieName +
				"=" +
				theme +
				"; path=/; max-age=${productThemeConfig.cookieMaxAgeSeconds}; SameSite=Lax";
		})();
	`;
}
