"use client";

import { createContext, useContext, useEffect } from "react";
import { ThemeProvider, useTheme } from "next-themes";

import {
	getProductThemeCookieString,
	isProductTheme,
	type ProductTheme,
} from "@/features/course/shared/utils/product-theme";
import { PRODUCT_THEME_STORAGE_KEY } from "@/features/course/shared/utils/product-theme";

type ProductThemeContextValue = {
	theme: ProductTheme;
	setTheme: (theme: ProductTheme) => void;
	toggleTheme: () => void;
};

const ProductThemeContext = createContext<ProductThemeContextValue | null>(
	null,
);

function ProductThemeContextBridge({
	initialTheme,
	children,
}: {
	initialTheme: ProductTheme;
	children: React.ReactNode;
}) {
	const { resolvedTheme, setTheme } = useTheme();
	const theme = isProductTheme(resolvedTheme) ? resolvedTheme : initialTheme;

	useEffect(() => {
		document.documentElement.dataset.productTheme = theme;
		document.cookie = getProductThemeCookieString(theme);
	}, [theme]);

	return (
		<ProductThemeContext.Provider
			value={{
				theme,
				setTheme,
				toggleTheme() {
					setTheme(theme === "dark" ? "light" : "dark");
				},
			}}
		>
			<div className="product-theme min-h-screen" data-theme={theme}>
				{children}
			</div>
		</ProductThemeContext.Provider>
	);
}

export function ProductThemeProvider({
	initialTheme,
	children,
}: {
	initialTheme: ProductTheme;
	children: React.ReactNode;
}) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme={initialTheme}
			enableSystem={false}
			storageKey={PRODUCT_THEME_STORAGE_KEY}
			disableTransitionOnChange
		>
			<ProductThemeContextBridge initialTheme={initialTheme}>
				{children}
			</ProductThemeContextBridge>
		</ThemeProvider>
	);
}

export function useProductTheme() {
	const context = useContext(ProductThemeContext);
	if (!context) {
		throw new Error("useProductTheme must be used inside ProductThemeProvider");
	}

	return context;
}
