import "server-only";

import { cookies } from "next/headers";

import {
	DEFAULT_PRODUCT_THEME,
	PRODUCT_THEME_COOKIE_NAME,
	isProductTheme,
	type ProductTheme,
} from "@/features/course/shared/utils/product-theme";

export async function getInitialProductTheme(): Promise<ProductTheme> {
	const cookieStore = await cookies();
	const cookieTheme = cookieStore.get(PRODUCT_THEME_COOKIE_NAME)?.value;

	return isProductTheme(cookieTheme) ? cookieTheme : DEFAULT_PRODUCT_THEME;
}
