"use client";

import {
	CheckoutElementsProvider,
	ExpressCheckoutElement,
	useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { apiRouteConfig } from "@/app/api/_lib/api-route-config";
import { assert } from "@/lib/assert";
import { capturePostHogProductEvent } from "@/lib/observability/posthog-client";
import { cn } from "@/lib/utils";

const STRIPE_EXPRESS_CHECKOUT_MIN_BUTTON_HEIGHT = 40;
const STRIPE_EXPRESS_CHECKOUT_MAX_BUTTON_HEIGHT = 55;

type ExpressCheckoutSessionResponse = {
	readonly clientSecret: string;
	readonly publishableKey: string;
	readonly returnUrl: string;
	readonly sessionId: string;
};

type ExpressCheckoutButtonState =
	| {
			readonly kind: "loading";
	  }
	| {
			readonly kind: "ready";
			readonly clientSecret: string;
			readonly returnUrl: string;
			readonly stripePromise: Promise<Stripe | null>;
	  }
	| {
			readonly kind: "unavailable";
	  };

type ExpressCheckoutButtonProps = {
	readonly className?: string;
	readonly testId?: string;
	readonly buttonHeight?: number;
	readonly onBeforeCheckout?: () => void | Promise<void>;
	readonly onAvailableChange?: (isAvailable: boolean) => void;
	readonly onError?: (message: string | null) => void;
};

export function ExpressCheckoutButton({
	className,
	testId,
	buttonHeight = 44,
	onBeforeCheckout,
	onAvailableChange,
	onError,
}: ExpressCheckoutButtonProps) {
	const [state, setState] = useState<ExpressCheckoutButtonState>({
		kind: "loading",
	});

	useEffect(() => {
		let isMounted = true;

		async function prepareExpressCheckout() {
			try {
				const response = await fetch(apiRouteConfig.stripeExpressCheckout, {
					method: "POST",
				});

				if (!response.ok) {
					setState({ kind: "unavailable" });
					return;
				}

				const data = (await response.json()) as ExpressCheckoutSessionResponse;
				assert(data.clientSecret, "Missing express checkout client secret.");
				assert(data.publishableKey, "Missing Stripe publishable key.");
				assert(data.returnUrl, "Missing express checkout return URL.");

				if (!isMounted) {
					return;
				}

				setState({
					kind: "ready",
					clientSecret: data.clientSecret,
					returnUrl: data.returnUrl,
					stripePromise: loadStripe(data.publishableKey),
				});
			} catch {
				if (!isMounted) {
					return;
				}
				setState({ kind: "unavailable" });
			}
		}

		void prepareExpressCheckout();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (state.kind !== "unavailable") {
			return;
		}
		onAvailableChange?.(false);
	}, [onAvailableChange, state.kind]);

	if (state.kind !== "ready") {
		return null;
	}

	return (
		<div className={cn("min-h-11", className)} data-testid={testId}>
			<CheckoutElementsProvider
				stripe={state.stripePromise}
				options={{
					clientSecret: state.clientSecret,
					elementsOptions: {
						appearance: {
							variables: {
								borderRadius: "8px",
							},
						},
					},
				}}
			>
				<ExpressCheckoutElementController
					buttonHeight={buttonHeight}
					returnUrl={state.returnUrl}
					onBeforeCheckout={onBeforeCheckout}
					onAvailableChange={onAvailableChange}
					onError={onError}
				/>
			</CheckoutElementsProvider>
		</div>
	);
}

function ExpressCheckoutElementController({
	buttonHeight,
	returnUrl,
	onBeforeCheckout,
	onAvailableChange,
	onError,
}: {
	readonly buttonHeight: number;
	readonly returnUrl: string;
	readonly onBeforeCheckout?: () => void | Promise<void>;
	readonly onAvailableChange?: (isAvailable: boolean) => void;
	readonly onError?: (message: string | null) => void;
}) {
	const checkoutResult = useCheckoutElements();
	const [isVisible, setIsVisible] = useState(false);
	const stripeButtonHeight = getStripeExpressCheckoutButtonHeight(buttonHeight);
	const options = useMemo(
		() => ({
			buttonHeight: stripeButtonHeight,
			buttonTheme: undefined,
			buttonType: undefined,
			layout: {
				maxColumns: 1,
				maxRows: 1,
				overflow: "auto" as const,
			},
			paymentMethodOrder: ["link", "applePay", "googlePay"],
			paymentMethods: undefined,
		}),
		[stripeButtonHeight],
	);

	useEffect(() => {
		if (checkoutResult.type !== "error") {
			return;
		}
		onAvailableChange?.(false);
	}, [checkoutResult.type, onAvailableChange]);

	const handleReady = useCallback(
		(event: { availablePaymentMethods?: Record<string, boolean> }) => {
			const isAvailable = Object.values(
				event.availablePaymentMethods ?? {},
			).some(Boolean);
			setIsVisible(isAvailable);
			onAvailableChange?.(isAvailable);
		},
		[onAvailableChange],
	);

	const handleConfirm = useCallback(
		async (
			event: Parameters<
				NonNullable<ComponentProps<typeof ExpressCheckoutElement>["onConfirm"]>
			>[0],
		) => {
			onError?.(null);
			capturePostHogProductEvent({
				event: "checkout_started",
				properties: {
					surface: "express_checkout",
				},
			});

			if (checkoutResult.type !== "success") {
				onError?.("Unable to confirm express checkout.");
				return;
			}

			if (onBeforeCheckout) {
				try {
					await onBeforeCheckout();
				} catch (error) {
					onError?.(
						error instanceof Error
							? error.message
							: "Unable to prepare checkout.",
					);
					return;
				}
			}

			const result = await checkoutResult.checkout.confirm({
				expressCheckoutConfirmEvent: event,
				returnUrl,
			});

			if (result.type === "error") {
				onError?.(result.error.message);
			}
		},
		[checkoutResult, onBeforeCheckout, onError, returnUrl],
	);

	if (checkoutResult.type === "error") {
		return null;
	}

	return (
		<div className={isVisible ? "block" : "hidden"} aria-hidden={!isVisible}>
			<ExpressCheckoutElement
				options={options}
				onReady={handleReady}
				onConfirm={handleConfirm}
			/>
		</div>
	);
}

function getStripeExpressCheckoutButtonHeight(buttonHeight: number) {
	return Math.min(
		STRIPE_EXPRESS_CHECKOUT_MAX_BUTTON_HEIGHT,
		Math.max(STRIPE_EXPRESS_CHECKOUT_MIN_BUTTON_HEIGHT, buttonHeight),
	);
}
