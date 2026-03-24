import type { Metadata } from "next";
import { SignInPage } from "@/features/auth/sign-in/sign-in-page";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default function Page() {
	return <SignInPage />;
}
