"use client";

import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

export type ProductTheme = "dark" | "light";

const STORAGE_KEY = "sbs:theme";

type ProductThemeContextValue = {
	theme: ProductTheme;
	setTheme: (theme: ProductTheme) => void;
	toggleTheme: () => void;
};

const ProductThemeContext = createContext<ProductThemeContextValue | null>(null);

function isProductTheme(value: string | null): value is ProductTheme {
	return value === "dark" || value === "light";
}

export function ProductThemeProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [theme, setThemeState] = useState<ProductTheme>("dark");

	useEffect(() => {
		const storedTheme = window.localStorage.getItem(STORAGE_KEY);
		if (isProductTheme(storedTheme)) {
			setThemeState(storedTheme);
		}
	}, []);

	const value = useMemo<ProductThemeContextValue>(
		() => ({
			theme,
			setTheme: (nextTheme) => {
				setThemeState(nextTheme);
				window.localStorage.setItem(STORAGE_KEY, nextTheme);
			},
			toggleTheme: () => {
				const nextTheme = theme === "dark" ? "light" : "dark";
				setThemeState(nextTheme);
				window.localStorage.setItem(STORAGE_KEY, nextTheme);
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
