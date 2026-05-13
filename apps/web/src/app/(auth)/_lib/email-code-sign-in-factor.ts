export type EmailCodeFirstFactor = {
	emailAddressId: string;
	primary?: boolean;
	safeIdentifier?: string;
	strategy: "email_code";
};

export type ClerkSignInWithFirstFactors = {
	supportedFirstFactors?: ReadonlyArray<{
		emailAddressId?: string;
		primary?: boolean;
		safeIdentifier?: string;
		strategy?: string;
	}>;
};

export function getSupportedFirstFactorStrategies(
	signIn: ClerkSignInWithFirstFactors | null | undefined,
) {
	return (
		signIn?.supportedFirstFactors
			?.map((factor) => factor.strategy)
			.filter((strategy): strategy is string => Boolean(strategy)) ?? []
	);
}

export function getEmailCodeFirstFactor(
	signIn: ClerkSignInWithFirstFactors | null | undefined,
	emailAddress: string,
): EmailCodeFirstFactor | null {
	const emailCodeFactors =
		signIn?.supportedFirstFactors?.filter(
			(factor): factor is EmailCodeFirstFactor =>
				factor.strategy === "email_code" &&
				typeof factor.emailAddressId === "string",
		) ?? [];

	if (emailCodeFactors.length === 0) {
		return null;
	}

	const normalizedEmailAddress = emailAddress.toLowerCase();
	return (
		emailCodeFactors.find(
			(factor) =>
				factor.safeIdentifier?.toLowerCase() === normalizedEmailAddress,
		) ??
		emailCodeFactors.find((factor) => factor.primary) ??
		emailCodeFactors[0] ??
		null
	);
}
