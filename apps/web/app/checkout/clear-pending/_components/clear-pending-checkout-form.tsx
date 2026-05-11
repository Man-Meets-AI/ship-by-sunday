"use client";

import { useEffect, useRef } from "react";

export function ClearPendingCheckoutForm({
	redirectPath,
}: {
	redirectPath: string;
}) {
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		formRef.current?.requestSubmit();
	}, []);

	return (
		<form
			ref={formRef}
			action={`/checkout/clear-pending/submit?redirect_url=${encodeURIComponent(
				redirectPath,
			)}`}
			method="post"
			className="flex flex-col gap-3"
		>
			<button
				type="submit"
				className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				Clear checkout and continue
			</button>
		</form>
	);
}
