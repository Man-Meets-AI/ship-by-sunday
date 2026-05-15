import { productConfig, routeConfig } from "@/config/product";
import {
	getHomePageRenderModel,
	type HomePageRenderModel,
} from "@/app/_lib/home-page-render-model";
import type { JsonObject } from "@/lib/json-value";
import { getMetadataBase } from "@/platform/next/metadata-base";

const baseUrl = getMetadataBase();

function getAbsoluteUrl(path: string) {
	return new URL(path, baseUrl).toString();
}

function createStructuredData(renderModel: HomePageRenderModel) {
	const graph: JsonObject[] = [
		{
			"@type": "Organization",
			name: productConfig.name,
			url: getAbsoluteUrl(routeConfig.home),
			logo: getAbsoluteUrl("/android-chrome-512x512.png"),
			description: productConfig.metadataDescription,
		},
	];

	if (
		renderModel.pricing.isEnabled &&
		renderModel.pricing.primaryCtaTarget.kind === "checkout"
	) {
		graph.push({
			"@type": "Product",
			name: productConfig.name,
			url: getAbsoluteUrl(routeConfig.home),
			description: productConfig.metadataDescription,
			offers: {
				"@type": "Offer",
				price: (productConfig.checkoutPriceUsdCents / 100).toString(),
				priceCurrency: productConfig.currency,
				availability: "https://schema.org/InStock",
				url: getAbsoluteUrl(`${routeConfig.home}${routeConfig.pricingHash}`),
			},
		});
	}

	if (renderModel.faq.isEnabled) {
		graph.push({
			"@type": "FAQPage",
			mainEntity: renderModel.faq.section.items.map((item) => ({
				"@type": "Question",
				name: item.question,
				acceptedAnswer: {
					"@type": "Answer",
					text: item.answer,
				},
			})),
		});
	}

	return JSON.stringify({
		"@context": "https://schema.org",
		"@graph": graph,
	}).replaceAll("<", "\\u003c");
}

export const getHomePageStructuredData = (
	renderModel: HomePageRenderModel = getHomePageRenderModel(),
) => createStructuredData(renderModel);
