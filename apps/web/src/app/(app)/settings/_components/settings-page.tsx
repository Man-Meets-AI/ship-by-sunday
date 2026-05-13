import { CodexConnectionCard } from "@/app/(app)/_components/codex-connection-card/codex-connection-card";
import { productConfig } from "@/config/product";

import { SettingsAccountCard } from "../../_components/settings-account-card";
import {
	SettingsPageDesktopToc,
	SettingsPageMobileJumpLinks,
} from "./settings-page-nav";

export function SettingsPageContent() {
	const settingsDescription = `Connect Codex and open Clerk for profile or security—in ${productConfig.name}.`;

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 pb-10 pt-2 xl:min-h-0 xl:overflow-y-auto lg:flex-row lg:items-start lg:gap-10">
			<SettingsPageDesktopToc />

			<div className="flex min-w-0 flex-1 flex-col gap-6 lg:max-w-3xl">
				<div className="space-y-1">
					<h1 className="font-heading-serif text-2xl font-normal text-foreground">
						Settings
					</h1>
					<p className="text-sm text-muted-foreground">{settingsDescription}</p>
				</div>

				<SettingsPageMobileJumpLinks />

				<div className="flex flex-col gap-6">
					<CodexConnectionCard />

					<div id="settings-account" className="scroll-mt-8">
						<SettingsAccountCard />
					</div>
				</div>
			</div>
		</div>
	);
}

export const SettingsPage = SettingsPageContent;
