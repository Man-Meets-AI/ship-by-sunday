import type { ReactNode } from "react";

import { IdentityLayoutHeader } from "@/app/(auth)/_components/identity-layout-header";
import {
	EdgeRouteContainer,
	EdgeRoutePage,
} from "@/components/layout/edge-route-surface";

export function IdentityPageFrame({ children }: { children: ReactNode }) {
	return (
		<EdgeRoutePage className="relative">
			<IdentityLayoutHeader />
			<div className="flex min-h-dvh items-center pb-10 pt-20">
				<EdgeRouteContainer>{children}</EdgeRouteContainer>
			</div>
		</EdgeRoutePage>
	);
}
