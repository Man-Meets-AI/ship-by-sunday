import { requireConvexEnv } from "./env";

export default {
	providers: [
		{
			domain: requireConvexEnv("CLERK_FRONTEND_API_URL"),
			applicationID: "convex",
		},
	],
};
