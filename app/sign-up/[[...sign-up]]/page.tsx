import { SignUp } from "@clerk/nextjs";

export default function Page() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
			<SignUp
				appearance={{
					elements: {
						card: "shadow-none border border-[#111111]",
					},
				}}
				forceRedirectUrl="/mission"
			/>
		</main>
	);
}
