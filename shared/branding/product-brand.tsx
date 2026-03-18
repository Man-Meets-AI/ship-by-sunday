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
};

export function ProductBrand({
	href,
	className = "",
	imageSize = 32,
	imageClassName = "",
	labelClassName = "",
	priority = false,
	showLabel = true,
}: ProductBrandProps) {
	const content = (
		<>
			<Image
				src={productConfig.images.logo}
				alt={`${productConfig.name} logo`}
				width={imageSize}
				height={imageSize}
				priority={priority}
				className={`shrink-0 ${imageClassName}`.trim()}
			/>
			{showLabel ? (
				<span
					className={
						labelClassName ||
						"font-display text-base uppercase tracking-[0.08em] text-ink"
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
