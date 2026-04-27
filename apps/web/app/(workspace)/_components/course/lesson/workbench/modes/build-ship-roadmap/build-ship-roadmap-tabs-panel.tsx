"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
	BUILD_PHASE_BADGES,
	BUILD_PHASE_CHECKLIST_OPTIONS,
	BUILD_SHIP_ROADMAP_FIELD_IDS,
	SHIP_PHASE_BADGES,
	SHIP_PHASE_CHECKLIST_OPTIONS,
} from "@/lib/course/lesson/workbench/modes/build-ship-roadmap/build-ship-roadmap-constants";
import { BuildShipRoadmapChecklistCard } from "./build-ship-roadmap-checklist-card";

type BuildShipRoadmapTabsPanelProps = {
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
};

export function BuildShipRoadmapTabsPanel({
	fieldValues,
	onFieldChange,
	invalidFieldIds,
}: BuildShipRoadmapTabsPanelProps) {
	return (
		<Tabs defaultValue="build" className="w-full">
			<TabsList className="grid w-full max-w-md grid-cols-2">
				<TabsTrigger value="build">Build</TabsTrigger>
				<TabsTrigger value="ship">Ship</TabsTrigger>
			</TabsList>
			<TabsContent value="build" className="mt-4 space-y-4">
				<BuildShipRoadmapChecklistCard
					title="Build phase checklist"
					description="Product + core services you wire before polish and launch."
					options={BUILD_PHASE_CHECKLIST_OPTIONS}
					badges={BUILD_PHASE_BADGES}
					value={fieldValues[BUILD_SHIP_ROADMAP_FIELD_IDS.buildPhaseChecklist]}
					onChange={(next) =>
						onFieldChange(
							BUILD_SHIP_ROADMAP_FIELD_IDS.buildPhaseChecklist,
							next,
						)
					}
					invalid={invalidFieldIds.has(
						BUILD_SHIP_ROADMAP_FIELD_IDS.buildPhaseChecklist,
					)}
				/>
			</TabsContent>
			<TabsContent value="ship" className="mt-4 space-y-4">
				<BuildShipRoadmapChecklistCard
					title="Ship phase checklist"
					description="Assets, deploy, and support so you can send a real link."
					options={SHIP_PHASE_CHECKLIST_OPTIONS}
					badges={SHIP_PHASE_BADGES}
					value={fieldValues[BUILD_SHIP_ROADMAP_FIELD_IDS.shipPhaseChecklist]}
					onChange={(next) =>
						onFieldChange(BUILD_SHIP_ROADMAP_FIELD_IDS.shipPhaseChecklist, next)
					}
					invalid={invalidFieldIds.has(
						BUILD_SHIP_ROADMAP_FIELD_IDS.shipPhaseChecklist,
					)}
				/>
			</TabsContent>
		</Tabs>
	);
}
