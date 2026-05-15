import { MetadataRoute } from "next";

import { getMetadataBase } from "@/platform/next/metadata-base";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = getMetadataBase();

	return {
		sitemap: [new URL("/sitemap.xml", baseUrl).toString()],
		rules: [
			{
				userAgent: "*",
				allow: ["/", "/starter", "/workers", "/worker-seal-team-6", "/blog"],
				disallow: [
					"/sign-in",
					"/sign-up",
					"/session-tasks",
					"/access-required",
					"/home",
					"/starter/home",
					"/starter/lessons",
					"/starter/generate-codebase",
					"/generate-codebase",
					"/generate-codebase/review",
					"/codebase",
					"/start",
					"/product",
					"/design",
					"/marketing",
					"/build-plan",
					"/tutorials",
					"/workers/setup",
					"/workers/doctor-pass",
					"/workers/findings",
					"/workers/loops",
					"/workers/runs",
					"/workers/privacy",
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
