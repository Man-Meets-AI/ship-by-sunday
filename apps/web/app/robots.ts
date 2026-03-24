import { MetadataRoute } from "next";

import { getMetadataBase } from "@/platform/next/metadata-base";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = getMetadataBase();

	return {
		sitemap: [new URL("/sitemap.xml", baseUrl).toString()],
		rules: [
			{
				userAgent: "*",
				allow: ["/", "/docs"],
				disallow: [
					"/sign-in",
					"/sign-up",
					"/session-tasks",
					"/access-required",
					"/mission",
					"/artifacts",
					"/settings",
					"/lesson/",
					"/checkout/",
					"/sso-callback",
					"/_next",
					"/api/",
				],
			},
		],
	};
}
