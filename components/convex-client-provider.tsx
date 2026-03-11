"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { publicEnv } from "@/lib/env/public";

const convex = new ConvexReactClient(publicEnv.NEXT_PUBLIC_CONVEX_URL);

export function ConvexClientProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
			{children}
		</ConvexProviderWithClerk>
	);
}
