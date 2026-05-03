import type { ReactNode } from "react";

import { IdentityPageFrame } from "@/app/(identity)/_components/identity-page-frame";

export default function IdentityLayout({ children }: { children: ReactNode }) {
	return <IdentityPageFrame>{children}</IdentityPageFrame>;
}
