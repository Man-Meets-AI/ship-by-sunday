export type VerificationMethod =
	| "email_code"
	| "phone_code"
	| "totp"
	| "backup_code";

export type VerificationStatus = "needs_second_factor" | "needs_client_trust";

export type SignInStep =
	| { kind: "credentials" }
	| {
			kind: "verification";
			method: VerificationMethod;
			status: VerificationStatus;
	  }
	| { kind: "reset_request" }
	| { kind: "reset_verify" }
	| { kind: "reset_submit" };
