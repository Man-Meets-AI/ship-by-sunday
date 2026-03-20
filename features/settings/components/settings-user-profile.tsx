"use client";

import { UserProfile } from "@clerk/nextjs";

export function SettingsUserProfile() {
	return <UserProfile path="/settings" />;
}
