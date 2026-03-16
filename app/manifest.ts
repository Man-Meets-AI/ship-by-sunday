import type { MetadataRoute } from "next";

import { productConfig } from "@/config/product";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: productConfig.name,
		short_name: productConfig.name,
		description: productConfig.metadataDescription,
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#ffffff",
		icons: [
			{
				src: "/android-chrome-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/android-chrome-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	};
}
