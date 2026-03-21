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
			title="Something went wrong"
			description="We hit an unexpected error while loading this page."
			code="app_error_boundary"
		/>
	);
}
