import { SignIn } from "@clerk/nextjs";
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
					<CardTitle>Sign in</CardTitle>
					<CardDescription>
						Use your email or a connected account to continue.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SignIn
						appearance={clerkAuthAppearance}
						path={routeConfig.signIn}
						signUpUrl={routeConfig.signUp}
						fallbackRedirectUrl={authViewConfig.fallbackRedirectUrl}
					/>
				</CardContent>
			</Card>
		</main>
	);
}
