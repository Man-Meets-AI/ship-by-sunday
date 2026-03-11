"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
	PRODUCT_THEME_COOKIE_NAME,
	PRODUCT_THEME_STORAGE_KEY,
	isProductTheme,
	type ProductTheme,
} from "@/lib/product-theme";

type ProductThemeContextValue = {
	theme: ProductTheme;
	setTheme: (theme: ProductTheme) => void;
	toggleTheme: () => void;
};

const ProductThemeContext = createContext<ProductThemeContextValue | null>(
	null,
);

export function ProductThemeProvider({
	initialTheme,
	children,
}: {
	initialTheme: ProductTheme;
	children: React.ReactNode;
}) {
	const [theme, setThemeState] = useState<ProductTheme>(() => {
		if (typeof document !== "undefined") {
			const rootTheme = document.documentElement.dataset.productTheme;
			if (isProductTheme(rootTheme)) {
				return rootTheme;
			}
		}

		return initialTheme;
	});

	useEffect(() => {
		document.documentElement.dataset.productTheme = theme;
		window.localStorage.setItem(PRODUCT_THEME_STORAGE_KEY, theme);
		document.cookie = `${PRODUCT_THEME_COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
	}, [theme]);

	const value = useMemo<ProductThemeContextValue>(
		() => ({
			theme,
			setTheme: (nextTheme) => {
				setThemeState(nextTheme);
			},
			toggleTheme: () => {
				const nextTheme = theme === "dark" ? "light" : "dark";
				setThemeState(nextTheme);
			},
		}),
		[theme],
	);

	return (
		<ProductThemeContext.Provider value={value}>
			<div className="product-theme" data-theme={theme}>
				{children}
			</div>
		</ProductThemeContext.Provider>
	);
}

export function useProductTheme() {
	const context = useContext(ProductThemeContext);
	if (!context) {
		throw new Error("useProductTheme must be used inside ProductThemeProvider");
	}

	return context;
}
