import Image from "next/image";
import Link from "next/link";

import { productConfig } from "@/config/product";

type ProductBrandProps = {
	href?: string;
	className?: string;
	imageSize?: number;
	imageClassName?: string;
	labelClassName?: string;
	priority?: boolean;
	showLabel?: boolean;
	/** When false, renders wordmark text only (no logo image). */
	showLogo?: boolean;
};

export function ProductBrand({
	href,
	className = "",
	imageSize = 32,
	imageClassName = "",
	labelClassName = "",
	priority = false,
	showLabel = true,
	showLogo = true,
}: ProductBrandProps) {
	const content = (
		<>
			{showLogo ? (
				<Image
					src={productConfig.images.logo}
					alt={`${productConfig.name} logo`}
					width={imageSize}
					height={imageSize}
					priority={priority}
					className={`shrink-0 ${imageClassName}`.trim()}
				/>
			) : null}
			{showLabel ? (
				<span
					className={
						labelClassName || "text-base font-semibold text-foreground"
					}
				>
					{productConfig.name}
				</span>
			) : null}
		</>
	);

	if (!href) {
		return (
			<div className={`inline-flex items-center gap-3 ${className}`.trim()}>
				{content}
			</div>
		);
	}

	return (
		<Link
			href={href}
			aria-label={productConfig.name}
			className={`inline-flex items-center gap-3 ${className}`.trim()}
		>
			{content}
		</Link>
	);
}
