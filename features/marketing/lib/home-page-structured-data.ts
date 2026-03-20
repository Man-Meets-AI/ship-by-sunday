import { productConfig } from "@/config/product";
import { homePageContent } from "@/features/marketing/content/home";
import { getMetadataBase } from "@/platform/next/metadata-base";

const baseUrl = getMetadataBase();

function getAbsoluteUrl(path: string) {
	return new URL(path, baseUrl).toString();
}

const createStructuredData = () =>
	JSON.stringify({
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Organization",
				name: productConfig.name,
				url: getAbsoluteUrl("/"),
				logo: getAbsoluteUrl("/android-chrome-512x512.png"),
				description: productConfig.metadataDescription,
			},
			{
				"@type": "Product",
				name: productConfig.name,
				url: getAbsoluteUrl("/"),
				description: productConfig.metadataDescription,
				offers: {
					"@type": "Offer",
					price: (productConfig.priceUsdCents / 100).toString(),
					priceCurrency: productConfig.currency,
					availability: "https://schema.org/InStock",
					url: getAbsoluteUrl("/#pricing"),
				},
			},
			{
				"@type": "FAQPage",
				mainEntity: homePageContent.faqSection.items.map((item) => ({
					"@type": "Question",
					name: item.question,
					acceptedAnswer: {
						"@type": "Answer",
						text: item.answer,
					},
				})),
			},
		],
	}).replaceAll("<", "\\u003c");

export const getHomePageStructuredData = () => createStructuredData();
