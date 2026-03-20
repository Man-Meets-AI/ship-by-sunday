"use client";

import { UserProfile } from "@clerk/nextjs";

const appearance = {
	elements: {
		rootBox: "w-full",
		card: "shadow-none border-0 bg-transparent",
		navbar: "bg-muted/50 border-border border-r",
		pageScrollBox: "bg-transparent",
	},
} as const;

export function SettingsUserProfile() {
	return <UserProfile appearance={appearance} path="/settings" />;
}
