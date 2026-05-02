export type StoredProductAccessStatus =
	| "granted"
	| "pending"
	| "revoked"
	| "refunded";

export type ProductAccessStatus =
	| "signed_out"
	| "token_missing"
	| "no_access"
	| StoredProductAccessStatus;

export type PaidCheckoutRecovery =
	| {
			kind: "sign_in_required";
			sessionId?: string;
			checkoutEmail?: string;
			currentAccountEmail?: string;
	  }
	| {
			kind: "wrong_account";
			sessionId: string;
			checkoutEmail?: string;
			currentAccountEmail?: string;
	  }
	| {
			kind: "payment_pending";
			sessionId: string;
			paymentStatus: string;
			checkoutEmail?: string;
			currentAccountEmail?: string;
	  };

export type ProductAccess = {
	clerkUserId: string | null;
	hasAccess: boolean;
	status: ProductAccessStatus;
	pendingCheckoutRecovery?: PaidCheckoutRecovery;
};
