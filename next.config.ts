import type { NextConfig } from "next";
import nextra from "nextra";

const withNextra = nextra({
	defaultShowCopyCode: true,
	search: false,
});

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "www.figma.com",
			},
		],
	},
};

export default withNextra(nextConfig);
