import { Moon, Palette, Sun } from "lucide-react";

import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Appearance = "light" | "dark";

export function AppShellUserMenuAppearance({
	appearance,
	setTheme,
}: {
	appearance: Appearance;
	setTheme: (t: string) => void;
}) {
	return (
		<>
			<div className="px-1.5 py-1.5">
				<p className="mb-1.5 flex items-center gap-1.5 px-0.5 text-xs font-medium text-muted-foreground">
					<Palette className="size-3.5 shrink-0 opacity-80" aria-hidden />
					Appearance
				</p>
				<ToggleGroup
					type="single"
					value={appearance}
					onValueChange={(v) => {
						if (v === "light" || v === "dark") setTheme(v);
					}}
					variant="outline"
					size="sm"
					spacing={0}
					className="w-full"
				>
					<ToggleGroupItem
						value="light"
						aria-label="Light mode"
						className="flex-1 gap-1.5"
					>
						<Sun className="size-3.5 shrink-0" aria-hidden />
						Light
					</ToggleGroupItem>
					<ToggleGroupItem
						value="dark"
						aria-label="Dark mode"
						className="flex-1 gap-1.5"
					>
						<Moon className="size-3.5 shrink-0" aria-hidden />
						Dark
					</ToggleGroupItem>
				</ToggleGroup>
			</div>
			<DropdownMenuSeparator />
		</>
	);
}
