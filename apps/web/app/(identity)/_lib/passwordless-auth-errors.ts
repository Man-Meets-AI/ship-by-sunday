type ClerkAuthError = {
	code?: string;
	longMessage?: string;
	message?: string;
};

export type RenderableClerkError = {
	code?: string;
	message?: string;
};

type ClerkAuthErrorKind = "invalid_email_code" | "missing_account";

const missingAccountCodes = new Set([
	"form_identifier_not_found",
	"identifier_not_found",
	"resource_not_found",
]);

const invalidEmailCodeCodes = new Set([
	"form_code_incorrect",
	"verification_code_invalid",
]);

export const missingPasswordlessAccountMessage =
	"We don't have an account for that email. Purchase a license first, then sign in with the checkout email.";

export const invalidEmailCodeMessage =
	"That code is incorrect. Use the latest email code or send a new one.";

function getClerkErrorMessage(error: RenderableClerkError | null | undefined) {
	if (!error) {
		return null;
	}

	const clerkError = error as ClerkAuthError;
	return clerkError.longMessage ?? clerkError.message ?? null;
}

function getClerkErrorSignature(
	error: RenderableClerkError | null | undefined,
) {
	if (!error) {
		return null;
	}

	return [error.code ?? "", getClerkErrorMessage(error) ?? ""].join("\n");
}

function classifyClerkAuthError(
	error: RenderableClerkError | null | undefined,
): ClerkAuthErrorKind | null {
	const code = error?.code;
	if (code && missingAccountCodes.has(code)) {
		return "missing_account";
	}
	if (code && invalidEmailCodeCodes.has(code)) {
		return "invalid_email_code";
	}

	const normalizedMessage = getClerkErrorMessage(error)?.trim().toLowerCase();
	if (!normalizedMessage) {
		return null;
	}
	if (
		normalizedMessage.includes("couldn't find your account") ||
		normalizedMessage.includes("could not find your account") ||
		normalizedMessage.includes("account not found")
	) {
		return "missing_account";
	}
	if (
		normalizedMessage === "is incorrect" ||
		normalizedMessage.includes("code is incorrect") ||
		normalizedMessage.includes("incorrect code")
	) {
		return "invalid_email_code";
	}

	return null;
}

export function getPasswordlessEmailError(
	error: RenderableClerkError | null | undefined,
) {
	return classifyClerkAuthError(error) === "missing_account"
		? { message: missingPasswordlessAccountMessage }
		: (error ?? null);
}

export function getMissingPasswordlessAccountError() {
	return { message: missingPasswordlessAccountMessage };
}

export function getPasswordlessCodeError(
	error: RenderableClerkError | null | undefined,
) {
	return classifyClerkAuthError(error) === "invalid_email_code"
		? { message: invalidEmailCodeMessage }
		: (error ?? null);
}

export function getPasswordlessGlobalErrors({
	fieldErrors,
	rootErrors,
}: {
	fieldErrors: ReadonlyArray<RenderableClerkError | null | undefined>;
	rootErrors: ReadonlyArray<RenderableClerkError> | null;
}) {
	if (!rootErrors?.length) {
		return null;
	}

	const fieldErrorSignatures = new Set(
		fieldErrors
			.map((error) => getClerkErrorSignature(error))
			.filter((signature): signature is string => Boolean(signature)),
	);
	const fieldErrorKinds = new Set(
		fieldErrors
			.map((error) => classifyClerkAuthError(error))
			.filter((kind): kind is ClerkAuthErrorKind => Boolean(kind)),
	);
	const visibleErrors = rootErrors.filter((error) => {
		const rootErrorSignature = getClerkErrorSignature(error);
		if (rootErrorSignature && fieldErrorSignatures.has(rootErrorSignature)) {
			return false;
		}

		const rootErrorKind = classifyClerkAuthError(error);
		return !rootErrorKind || !fieldErrorKinds.has(rootErrorKind);
	});

	return visibleErrors.length > 0 ? visibleErrors : null;
}
