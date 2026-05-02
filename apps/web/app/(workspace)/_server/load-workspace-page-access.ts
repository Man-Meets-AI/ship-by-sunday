import "server-only";

import type { ProductAccess } from "@/lib/product-access";
import { getServerProductAccess } from "@/platform/access/product-access";

export type WorkspacePageAccess =
	| {
			kind: "granted";
			access: ProductAccess;
	  }
	| {
			kind: "access_required";
			access: ProductAccess;
	  };

export async function loadWorkspacePageAccess(): Promise<WorkspacePageAccess> {
	const access = await getServerProductAccess();

	if (access.hasAccess) {
		return {
			kind: "granted",
			access,
		};
	}

	return {
		kind: "access_required",
		access,
	};
}
