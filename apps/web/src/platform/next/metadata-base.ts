import { getAppBaseUrl } from "@/platform/next/app-url";

const localMetadataBase = new URL("http://localhost:3000");

export function getMetadataBase() {
	try {
		return new URL(getAppBaseUrl());
	} catch {
		return localMetadataBase;
	}
}
