"use client";

import { ErrorBoundaryScreen } from "@/app/_components/error-boundary-screen";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="en">
			<body>
				<ErrorBoundaryScreen
					error={error}
					reset={reset}
					title="Workspace unavailable"
					description="A root-level error interrupted the app before it could render."
					code="global_error_boundary"
				/>
			</body>
		</html>
	);
}
