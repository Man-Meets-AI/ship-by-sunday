"use client";

import { ErrorBoundaryScreen } from "@/features/observability/components/error-boundary-screen";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<ErrorBoundaryScreen
			error={error}
			reset={reset}
			title="Protected workspace error"
			description="The workspace failed while loading protected content. Try again."
			code="protected_app_error_boundary"
		/>
	);
}
