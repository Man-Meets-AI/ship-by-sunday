import Link from "next/link";
import { FileSearch } from "lucide-react";

import { ProtectedRoutePanel } from "@/components/app/protected-route-surface";
import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";

export function WorkspaceFindingsEmptyState() {
	return (
		<ProtectedRoutePanel className="p-5">
			<div className="flex items-start gap-3">
				<FileSearch className="mt-0.5 size-4 text-foreground" aria-hidden />
				<div className="min-w-0">
					<h2 className="text-base font-semibold text-foreground">
						No uploaded findings yet
					</h2>
					<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
						Run the local doctor pass and approve the sync preview before the
						Top 9 ledger appears here.
					</p>
					<Button asChild className="mt-4" size="sm">
						<Link href={routeConfig.workspaceDoctorPass}>Open Doctor Pass</Link>
					</Button>
				</div>
			</div>
		</ProtectedRoutePanel>
	);
}
