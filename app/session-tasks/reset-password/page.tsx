import { TaskResetPassword } from "@clerk/nextjs";

import { AuthPageShell } from "@/features/auth/sign-in/auth-page-shell";
import { getTaskRedirectUrlComplete } from "@/features/auth/sign-in/sign-in-route-utils";
import { clerkAuthAppearance } from "@/lib/clerk-auth-appearance";

export default function Page() {
	return (
		<AuthPageShell
			title="Reset your password"
			description="Finish the Clerk task so we can complete your sign-in."
		>
			<TaskResetPassword
				appearance={clerkAuthAppearance}
				redirectUrlComplete={getTaskRedirectUrlComplete()}
			/>
		</AuthPageShell>
	);
}
