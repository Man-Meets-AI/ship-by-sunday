import type { SupportModeStatus } from "@/platform/admin-impersonation";

export function formatSupportModeTimeRemaining(ms: number | null) {
	if (ms === null) {
		return "needs attention";
	}
	const totalSeconds = Math.max(0, Math.floor(ms / 1000));
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	if (hours > 0) {
		return `${hours}h ${minutes}m left`;
	}
	return `${minutes}m left`;
}

export function getSupportModeMessage(status: SupportModeStatus) {
	if (status.state === "active") {
		return "Support mode active";
	}
	if (status.state === "expired") {
		return "Support mode expired";
	}
	if (status.state === "stopped") {
		return "Support mode stopped";
	}
	if (status.state === "kill_switch_disabled") {
		return "Support mode disabled";
	}
	if (status.state === "invalid_mismatch") {
		return "Support mode mismatch";
	}
	return "Unsupported support mode";
}

export function shouldRenderSupportModeStatus(status: SupportModeStatus) {
	return (
		status.state === "active" ||
		status.state === "expired" ||
		status.state === "stopped" ||
		status.state === "invalid_mismatch" ||
		status.state === "kill_switch_disabled" ||
		status.state === "unsupported_clerk_dashboard_impersonation"
	);
}
