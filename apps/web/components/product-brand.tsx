import Link from "next/link";

import { productConfig } from "@/config/product";

export const productWordmarkFontClassName =
	"[font-family:var(--font-bebas-neue),ui-sans-serif,system-ui,sans-serif]";

export const productWordmarkClassName =
	`${productWordmarkFontClassName} text-2xl font-normal leading-none tracking-wide text-foreground sm:text-3xl`;

type ProductBrandProps = {
	href?: string;
	className?: string;
	labelClassName?: string;
	uppercase?: boolean;
};

export function ProductBrand({
	href,
	className = "",
	labelClassName = "",
	uppercase = true,
}: ProductBrandProps) {
	const content = (
		<span className={labelClassName || productWordmarkClassName}>
			{uppercase ? productConfig.name.toUpperCase() : productConfig.name}
		</span>
	);

	if (!href) {
		return <div className={`inline-flex items-center ${className}`.trim()}>{content}</div>;
	}

	return (
		<Link
			href={href}
			aria-label={productConfig.name}
			className={`inline-flex items-center ${className}`.trim()}
		>
			{content}
		</Link>
	);
}
