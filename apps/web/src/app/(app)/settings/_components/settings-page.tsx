import { CodexConnectionCard } from "@/app/(app)/_components/codex-connection-card/codex-connection-card";
import {
	ProtectedRouteDescription,
	ProtectedRouteEyebrow,
	ProtectedRouteHeader,
	ProtectedRoutePage,
	ProtectedRouteTitle,
} from "@/components/app/protected-route-surface";
import { productConfig } from "@/config/product";

import { SettingsAccountCard } from "../../_components/settings-account-card";
import {
	SettingsPageDesktopToc,
	SettingsPageMobileJumpLinks,
} from "./settings-page-nav";

export function SettingsPageContent() {
	const settingsDescription = `Connect Codex and open Clerk for profile or security—in ${productConfig.name}.`;

	return (
		<ProtectedRoutePage className="max-w-6xl gap-6 xl:min-h-0 xl:overflow-y-auto">
			<ProtectedRouteHeader>
				<ProtectedRouteEyebrow>Settings</ProtectedRouteEyebrow>
				<ProtectedRouteTitle>Settings</ProtectedRouteTitle>
				<ProtectedRouteDescription>
					{settingsDescription}
				</ProtectedRouteDescription>
			</ProtectedRouteHeader>

			<div className="grid gap-6 lg:grid-cols-[11rem_minmax(0,1fr)] lg:items-start lg:gap-8">
				<SettingsPageDesktopToc />

				<div className="flex min-w-0 flex-1 flex-col gap-5 lg:max-w-3xl">
					<SettingsPageMobileJumpLinks />

					<div className="flex flex-col gap-5">
						<CodexConnectionCard />

						<div id="settings-account" className="scroll-mt-8">
							<SettingsAccountCard />
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoutePage>
	);
}

export const SettingsPage = SettingsPageContent;
