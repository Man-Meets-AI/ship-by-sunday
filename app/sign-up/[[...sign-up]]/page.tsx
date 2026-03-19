import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authViewConfig, routeConfig } from "@/config/product";
import { clerkAuthAppearance } from "@/lib/clerk-auth-appearance";

export default function Page() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
			<Card className="w-full max-w-md">
				<CardHeader className="items-start text-left">
					<CardAction>
						<Button variant="link" size="sm" className="h-auto px-0" asChild>
							<Link href="/">Home</Link>
						</Button>
					</CardAction>
					<CardTitle>Create your account</CardTitle>
					<CardDescription>
						Sign up with email or a connected account.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SignUp
						appearance={clerkAuthAppearance}
						path={routeConfig.signUp}
						signInUrl={routeConfig.signIn}
						fallbackRedirectUrl={authViewConfig.fallbackRedirectUrl}
					/>
				</CardContent>
			</Card>
		</main>
	);
}
