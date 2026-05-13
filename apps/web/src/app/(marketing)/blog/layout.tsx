import type { Metadata } from "next";

import { getBlogMetadataDefaults } from "@/app/(marketing)/blog/_lib/blog-metadata";

export const metadata: Metadata = getBlogMetadataDefaults();

export default function BlogLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
