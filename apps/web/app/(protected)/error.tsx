"use client";

import { ErrorBoundaryScreen } from "@/app/_components/error-boundary-screen";

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
			title="Protected app error"
			description="The app failed while loading protected content. Try again."
			code="protected_app_error_boundary"
		/>
	);
}
