import type {
	WorkspaceDefaultOpenDestination,
	WorkspaceOpenDestinationOption,
} from "@/app/(protected)/_lib/workspace-setup-readiness-model";
import { cn } from "@/lib/utils";

export function SetupOpenDestinationControl({
	value,
	options,
	onChange,
	pending,
}: {
	value: WorkspaceDefaultOpenDestination;
	options: WorkspaceOpenDestinationOption[];
	onChange: (value: WorkspaceDefaultOpenDestination) => void;
	pending: boolean;
}) {
	return (
		<section className="rounded-xl border border-border/60 bg-background p-4">
			<div className="space-y-1">
				<h2 className="text-sm font-semibold text-foreground">
					Default open destination
				</h2>
				<p className="text-sm leading-6 text-muted-foreground">
					Choose where local proof, diffs, and report refs should open when the
					runner supports it.
				</p>
			</div>
			<div className="mt-4 grid gap-2">
				{options.map((option) => {
					const selected = option.value === value;
					return (
						<button
							key={option.value}
							type="button"
							aria-pressed={selected}
							disabled={pending}
							onClick={() => onChange(option.value)}
							className={cn(
								"rounded-lg border px-3 py-2 text-left transition-colors disabled:pointer-events-none disabled:opacity-60",
								selected
									? "border-foreground/25 bg-muted/70"
									: "border-border/60 bg-background hover:bg-muted/40",
							)}
						>
							<span className="block text-sm font-medium text-foreground">
								{option.label}
							</span>
							<span className="mt-1 block text-xs leading-5 text-muted-foreground">
								{option.description}
							</span>
						</button>
					);
				})}
			</div>
		</section>
	);
}
