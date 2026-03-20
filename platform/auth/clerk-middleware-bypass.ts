export function shouldBypassClerkProtection() {
	return (
		process.env.DISABLE_CLERK_MIDDLEWARE === "1" &&
		(process.env.PLAYWRIGHT_USE_LOCAL_SERVER === "1" ||
			process.env.NODE_ENV === "test")
	);
}
