import type { StarterRepoAccessStatus } from "@/config/starter-repo-access-copy";

export type StarterRepoAccessRecord = {
	githubUsername: string;
	status: Exclude<StarterRepoAccessStatus, "loading" | "none">;
	requestedAt: number;
	updatedAt: number;
	invitedAt?: number;
	acceptedAt?: number;
	lastError?: string;
};

export function formatStarterRepoUsernameLabel(
	record: StarterRepoAccessRecord | null | undefined,
) {
	return record ? `@${record.githubUsername}` : null;
}
