import type {
	VerificationMethod,
	VerificationStatus,
} from "@/features/auth/sign-in/types";

export function getVerificationCopy(
	method: VerificationMethod,
	status: VerificationStatus,
) {
	if (method === "backup_code") {
		return {
			description:
				"Enter one of your backup codes to finish signing in on this device.",
			label: "Backup code",
			submitLabel: "Verify backup code",
			usesOtp: false,
		};
	}

	if (method === "totp") {
		return {
			description:
				status === "needs_client_trust"
					? "Enter the authenticator code for this trusted-device check."
					: "Enter the authenticator code from your app to finish signing in.",
			label: "Authenticator code",
			submitLabel: "Verify authenticator code",
			usesOtp: false,
		};
	}

	const isEmail = method === "email_code";

	return {
		description: isEmail
			? "We sent a verification code to your email address."
			: "We sent a verification code to your phone number.",
		label: isEmail ? "Email code" : "Phone code",
		submitLabel: isEmail ? "Verify email code" : "Verify phone code",
		usesOtp: true,
	};
}

export function getAlternateMethodLabel(method: VerificationMethod) {
	switch (method) {
		case "backup_code":
			return "Use a backup code instead";
		case "email_code":
			return "Use an email code instead";
		case "phone_code":
			return "Use a phone code instead";
		case "totp":
			return "Use your authenticator instead";
		default:
			return method;
	}
}
