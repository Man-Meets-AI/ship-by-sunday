"use client";

import { Search, UserRound } from "lucide-react";
import { useState, useTransition } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { searchAdminImpersonationCustomersAction } from "../actions";
import type {
	AdminImpersonationCustomer,
	AdminImpersonationPageData,
} from "../_server/admin-impersonation-server";

export function CustomerPicker({
	initialCustomers,
	selectedCustomer,
	onSelectCustomer,
}: {
	initialCustomers: AdminImpersonationPageData["initialCustomers"];
	selectedCustomer: AdminImpersonationCustomer | null;
	onSelectCustomer: (customer: AdminImpersonationCustomer) => void;
}) {
	const [query, setQuery] = useState("");
	const [customers, setCustomers] = useState(initialCustomers);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function searchCustomers() {
		setError(null);
		startTransition(async () => {
			const result = await searchAdminImpersonationCustomersAction(query);
			if (!result.ok) {
				setError(result.message);
				return;
			}
			setCustomers(result.customers);
		});
	}

	return (
		<div className="space-y-3">
			<div className="flex gap-2">
				<Input
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Search customer email"
					aria-label="Search customer email"
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							searchCustomers();
						}
					}}
				/>
				<Button
					type="button"
					variant="outline"
					onClick={searchCustomers}
					disabled={isPending}
				>
					<Search aria-hidden />
					Search
				</Button>
			</div>
			{error ? <p className="text-sm text-destructive">{error}</p> : null}
			<div className="grid gap-2">
				{customers.map((customer) => {
					const selected =
						selectedCustomer?.clerkUserId === customer.clerkUserId;
					return (
						<button
							key={customer.clerkUserId}
							type="button"
							className={cn(
								"flex min-h-14 items-center gap-3 rounded-lg border p-2 text-left text-sm transition-colors hover:bg-muted",
								selected && "border-primary bg-primary/5",
							)}
							onClick={() => onSelectCustomer(customer)}
						>
							<Avatar size="sm" className="size-8">
								{customer.imageUrl ? (
									<AvatarImage src={customer.imageUrl} alt="" />
								) : null}
								<AvatarFallback>
									<UserRound className="size-4" aria-hidden />
								</AvatarFallback>
							</Avatar>
							<span className="min-w-0">
								<span className="block truncate font-medium">
									{customer.email}
								</span>
								<span className="block truncate text-xs text-muted-foreground">
									{customer.name ?? customer.clerkUserId}
								</span>
							</span>
						</button>
					);
				})}
				{customers.length === 0 ? (
					<div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
						No matching non-admin Clerk customers.
					</div>
				) : null}
			</div>
		</div>
	);
}
