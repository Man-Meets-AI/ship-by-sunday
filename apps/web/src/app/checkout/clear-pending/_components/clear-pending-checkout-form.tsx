"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

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
			<Button type="submit" className="w-full justify-center">
				Clear checkout and continue
			</Button>
		</form>
	);
}
