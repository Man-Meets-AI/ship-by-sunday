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

export type ProductAccess = {
	clerkUserId: string | null;
	hasAccess: boolean;
	status: ProductAccessStatus;
};
