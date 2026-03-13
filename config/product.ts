export const PRODUCT_APP_ID = "ship-by-sunday" as const;
export const PRODUCT_COURSE_SLUG = "ship-by-sunday" as const;

export const productConfig = {
	appId: PRODUCT_APP_ID,
	courseSlug: PRODUCT_COURSE_SLUG,
	name: "Ship by Sunday",
	shortMark: "MMAI",
	promise: "Go from idea to v1 this weekend",
	metadataDescription:
		"Go from idea to v1 this weekend with an action-first system for engineers who want to stop circling unfinished ideas.",
	priceUsdCents: 50000,
	priceDisplay: "$500",
	currency: "usd",
	bonusName: "Product Management for Beginners",
	images: {
		founderProof: "/founder-proof.jpg",
		missionPreview: "/product/mission-bg.png",
	},
} as const;
