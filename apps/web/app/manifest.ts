import type { MetadataRoute } from "next";

import { generatedDesignSystem } from "@/config/generated-design-system";
import { manifestConfig, productConfig } from "@/config/product";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: productConfig.name,
		short_name: productConfig.name,
		description: productConfig.metadataDescription,
		start_url: manifestConfig.startUrl,
		display: manifestConfig.display,
		background_color: manifestConfig.backgroundColorHex,
		theme_color: generatedDesignSystem.preset.themeHex,
		icons: [...manifestConfig.icons],
	};
}
