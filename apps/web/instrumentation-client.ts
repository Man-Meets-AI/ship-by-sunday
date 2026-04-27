import { reportClientError } from "@/lib/observability/client-error-report";

declare global {
	interface Window {
		__observabilityClientInstalled?: boolean;
	}
}

if (typeof window !== "undefined" && !window.__observabilityClientInstalled) {
	window.__observabilityClientInstalled = true;

	window.addEventListener("error", (event) => {
		reportClientError({
			error: event.error ?? event.message,
			pathname: window.location.pathname,
			code: "window_error",
			details: {
				filename: event.filename,
				line: event.lineno,
				column: event.colno,
			},
		});
	});

	window.addEventListener("unhandledrejection", (event) => {
		reportClientError({
			error: event.reason,
			pathname: window.location.pathname,
			code: "unhandled_rejection",
		});
	});
}
