import { SignIn } from "@clerk/nextjs";

export default function Page() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
			<SignIn
				appearance={{
					elements: {
						card: "shadow-none border border-[#111111]",
					},
				}}
				fallbackRedirectUrl="/mission"
			/>
		</main>
	);
}
