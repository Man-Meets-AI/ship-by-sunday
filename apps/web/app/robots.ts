import { MetadataRoute } from "next";

import { getMetadataBase } from "@/platform/next/metadata-base";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = getMetadataBase();

	return {
		sitemap: [new URL("/sitemap.xml", baseUrl).toString()],
		rules: [
			{
				userAgent: "*",
				allow: ["/", "/docs", "/blog"],
				disallow: [
					"/sign-in",
					"/sign-up",
					"/session-tasks",
					"/access-required",
					"/home",
					"/generate-codebase",
					"/generate-codebase/review",
					"/codebase",
					"/start",
					"/product",
					"/design",
					"/marketing",
					"/build-plan",
					"/tutorials",
					"/workers",
					"/review",
					"/mission",
					"/artifacts",
					"/settings",
					"/lesson/",
					"/workspace",
					"/checkout/",
					"/_next",
					"/api/",
				],
			},
		],
	};
}
