import type { ReactNode } from "react";
import { render } from "@testing-library/react";

import IdentityLayout from "@/app/(identity)/layout";

export function renderInIdentityLayout(page: ReactNode) {
	return render(<IdentityLayout>{page}</IdentityLayout>);
}
