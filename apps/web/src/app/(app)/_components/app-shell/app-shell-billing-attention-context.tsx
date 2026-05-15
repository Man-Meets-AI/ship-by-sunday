"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import type { AppShellBillingAttention } from "./app-shell-props";

const AppShellBillingAttentionContext =
	createContext<AppShellBillingAttention | null>(null);

export function AppShellBillingAttentionProvider({
	billingAttention,
	children,
}: {
	billingAttention: AppShellBillingAttention | null;
	children: ReactNode;
}) {
	return (
		<AppShellBillingAttentionContext.Provider value={billingAttention}>
			{children}
		</AppShellBillingAttentionContext.Provider>
	);
}

export function useAppShellBillingAttention() {
	return useContext(AppShellBillingAttentionContext);
}
