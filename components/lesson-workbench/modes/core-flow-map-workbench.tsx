"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "convex/react";
import {
	Background,
	type Edge,
	Handle,
	MarkerType,
	type Node,
	type NodeProps,
	Position,
	ReactFlow,
	type ReactFlowInstance,
} from "@xyflow/react";
import { toPng } from "html-to-image";

import { api } from "@/convex/_generated/api";
import {
	CORE_FLOW_ACTORS_FIELD_ID,
	CORE_FLOW_ENDING_FIELD_ID,
	CORE_FLOW_IMAGE_FIELD_ID,
	CORE_FLOW_MAX_ACTORS,
	CORE_FLOW_MAX_STEPS,
	CORE_FLOW_MIN_STEPS,
	CORE_FLOW_STEPS_FIELD_ID,
	EMPTY_UPLOAD_FIELD_VALUE,
	type CoreFlowGraphNode,
	coreFlowNeedsSeeding,
	getCoreFlowDraftState,
	getCoreFlowGraph,
	getCoreFlowSeedValues,
} from "@/lib/course/core-flow-map";

import { fieldLabelClass, inputBaseClass } from "../fields/field-styles";
import { getUploadMetadata } from "../fields/value-codecs";
import { ArtifactContext } from "../shared/artifact-context";
import { StatusRail } from "../shared/status-rail";
import { TemplateDownloadCard } from "../shared/template-download-card";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import type { WorkbenchModeProps } from "../types";

type CoreFlowNodeData = CoreFlowGraphNode;

const actionButtonClass =
	"inline-flex items-center justify-center rounded-none border border-product-border bg-product-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-text transition-colors hover:bg-product-surface-alt disabled:cursor-not-allowed disabled:opacity-45";

const primaryActionButtonClass =
	"inline-flex items-center justify-center rounded-none border border-product-accent bg-product-chip px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg disabled:cursor-not-allowed disabled:border-product-border disabled:bg-product-surface disabled:text-product-muted";

function CoreFlowStageNode({ data, selected }: NodeProps<Node<CoreFlowNodeData>>) {
	const isActor = data.kind === "actor";
	const isEnding = data.kind === "ending";

	return (
		<div
			className={`min-w-[168px] max-w-[228px] rounded-none border px-3 py-3 shadow-[0_12px_32px_rgba(17,17,17,0.08)] ${
				isEnding
					? "border-product-accent bg-product-chip text-product-accent"
					: "border-product-border/80 bg-product-surface text-product-text"
			} ${selected ? "ring-2 ring-product-accent/40" : ""}`}
		>
			<Handle
				type="target"
				position={Position.Left}
				isConnectable={false}
				className="!h-2.5 !w-2.5 !rounded-none !border !border-product-border !bg-product-surface"
			/>
			<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
				{data.eyebrow}
			</p>
			<p
				className={`mt-1 text-sm font-medium leading-snug ${
					data.placeholder
						? "text-product-muted"
						: isEnding
							? "text-product-accent"
							: "text-product-text"
				}`}
			>
				{data.label}
			</p>
			{data.actorName ? (
				<p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
					{data.actorName}
				</p>
			) : null}
			<Handle
				type="source"
				position={Position.Right}
				isConnectable={false}
				className="!h-2.5 !w-2.5 !rounded-none !border !border-product-border !bg-product-surface"
			/>
		</div>
	);
}

const nodeTypes = {
	coreFlowNode: CoreFlowStageNode,
};

function getSelectedKind(nodeId: string | null) {
	if (!nodeId) {
		return null;
	}

	if (nodeId.startsWith("actor:")) {
		return "actor";
	}

	if (nodeId.startsWith("step:")) {
		return "step";
	}

	if (nodeId === "ending") {
		return "ending";
	}

	return null;
}

function getSelectedIndex(nodeId: string | null) {
	if (!nodeId || !nodeId.includes(":")) {
		return null;
	}

	const [, index] = nodeId.split(":");
	return Number.isFinite(Number(index)) ? Number(index) : null;
}

async function uploadBlob({
	blob,
	fileName,
	mimeType,
	generateUploadUrl,
}: {
	blob: Blob;
	fileName: string;
	mimeType: string;
	generateUploadUrl: () => Promise<string>;
}) {
	const uploadUrl = await generateUploadUrl();
	const response = await fetch(uploadUrl, {
		method: "POST",
		headers: {
			"Content-Type": mimeType,
		},
		body: blob,
	});

	if (!response.ok) {
		throw new Error("Upload failed");
	}

	const result = (await response.json()) as { storageId?: string };
	if (!result.storageId) {
		throw new Error("Missing storage id");
	}

	return result.storageId;
}

export function CoreFlowMapWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	objectiveTasks,
	completedTaskCount,
	fieldValuesReady = true,
}: WorkbenchModeProps & { fieldValuesReady?: boolean }) {
	const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [reactFlowInstance, setReactFlowInstance] =
		useState<ReactFlowInstance<Node<CoreFlowNodeData>, Edge> | null>(null);
	const [savePhase, setSavePhase] = useState<
		"idle" | "stale" | "saving" | "saved" | "error"
	>("idle");
	const [saveMessage, setSaveMessage] = useState<string | null>(null);
	const stageRef = useRef<HTMLDivElement | null>(null);
	const externalUploadInputRef = useRef<HTMLInputElement | null>(null);
	const hasSeededRef = useRef(false);
	const flowState = useMemo(
		() => getCoreFlowDraftState(fieldValues as Record<string, unknown>),
		[fieldValues],
	);
	const graph = useMemo(
		() => getCoreFlowGraph(fieldValues as Record<string, unknown>),
		[fieldValues],
	);
	const selectedKind = getSelectedKind(selectedNodeId);
	const selectedIndex = getSelectedIndex(selectedNodeId);
	const savedImage = getUploadMetadata(fieldValues[CORE_FLOW_IMAGE_FIELD_ID]);
	const canAddActor = flowState.actorDrafts.length < CORE_FLOW_MAX_ACTORS;
	const canAddStep = flowState.stepDrafts.length < CORE_FLOW_MAX_STEPS;
	const canSaveImage =
		flowState.validActorCount >= 1 &&
		flowState.validActorCount <= CORE_FLOW_MAX_ACTORS &&
		flowState.filledStepCount >= CORE_FLOW_MIN_STEPS &&
		flowState.filledStepCount <= CORE_FLOW_MAX_STEPS &&
		!flowState.hasPartialStep &&
		flowState.endingDraft.length > 0;

	const nodes = useMemo<Node<CoreFlowNodeData>[]>(
		() =>
			graph.nodes.map((node) => ({
				id: node.id,
				type: "coreFlowNode",
				position: { x: node.x, y: node.y },
				data: node,
				draggable: false,
				selectable: true,
			})),
		[graph.nodes],
	);
	const edges = useMemo<Edge[]>(
		() =>
			graph.edges.map((edge) => ({
				id: edge.id,
				source: edge.source,
				target: edge.target,
				type: "smoothstep",
				animated: false,
				markerEnd: {
					type: MarkerType.ArrowClosed,
					width: 18,
					height: 18,
				},
				style:
					edge.kind === "actor"
						? {
								stroke: "rgba(17, 17, 17, 0.52)",
								strokeWidth: 1.4,
							}
						: {
								stroke: "rgba(17, 17, 17, 0.92)",
								strokeWidth: 1.6,
							},
			})),
		[graph.edges],
	);

	useEffect(() => {
		if (
			!fieldValuesReady ||
			hasSeededRef.current ||
			!coreFlowNeedsSeeding(fieldValues as Record<string, unknown>)
		) {
			return;
		}

		hasSeededRef.current = true;
		const seedValues = getCoreFlowSeedValues(
			pinnedArtifacts.map((artifact) => ({
				artifactKey: artifact.artifactKey,
				fieldValues: artifact.fieldValues as Record<string, unknown>,
			})),
		);

		for (const [fieldId, value] of Object.entries(seedValues)) {
			onFieldChange(fieldId, value);
		}
	}, [fieldValues, fieldValuesReady, onFieldChange, pinnedArtifacts]);

	useEffect(() => {
		if (selectedNodeId && graph.nodes.some((node) => node.id === selectedNodeId)) {
			return;
		}

		setSelectedNodeId(graph.nodes[0]?.id ?? null);
	}, [graph.nodes, selectedNodeId]);

	useEffect(() => {
		if (!reactFlowInstance) {
			return;
		}

		reactFlowInstance.fitView({
			padding: 0.18,
			duration: 240,
		});
	}, [edges.length, nodes.length, reactFlowInstance]);

	function applyStructuredPatch(entries: Array<[string, unknown]>) {
		if (flowState.hasSavedImage) {
			onFieldChange(CORE_FLOW_IMAGE_FIELD_ID, EMPTY_UPLOAD_FIELD_VALUE);
			setSavePhase("stale");
			setSaveMessage("Map changed. Save the current map image again.");
		}

		for (const [fieldId, value] of entries) {
			onFieldChange(fieldId, value);
		}
	}

	function updateActor(index: number, nextValue: string) {
		const nextActors = [...flowState.actorDrafts];
		nextActors[index] = nextValue;
		applyStructuredPatch([[CORE_FLOW_ACTORS_FIELD_ID, nextActors]]);
	}

	function addActor() {
		if (!canAddActor) {
			return;
		}

		const nextActors = [
			...flowState.actorDrafts,
			`Actor ${flowState.actorDrafts.length + 1}`,
		];
		applyStructuredPatch([[CORE_FLOW_ACTORS_FIELD_ID, nextActors]]);
		setSelectedNodeId(`actor:${nextActors.length - 1}`);
	}

	function removeActor(index: number) {
		const removedActor = flowState.actorDrafts[index] ?? "";
		const nextActors = flowState.actorDrafts.filter(
			(_, actorIndex) => actorIndex !== index,
		);
		const nextSteps = flowState.stepDrafts.map(([actor, step]) => [
			actor.trim() === removedActor.trim() ? "" : actor,
			step,
		]);
		applyStructuredPatch([
			[CORE_FLOW_ACTORS_FIELD_ID, nextActors],
			[CORE_FLOW_STEPS_FIELD_ID, nextSteps],
		]);
		setSelectedNodeId(nextActors.length > 0 ? "actor:0" : "step:0");
	}

	function updateStep(index: number, nextValue: [string, string]) {
		const nextSteps = flowState.stepDrafts.map((row, rowIndex) =>
			rowIndex === index ? nextValue : row,
		);
		applyStructuredPatch([[CORE_FLOW_STEPS_FIELD_ID, nextSteps]]);
	}

	function addStep() {
		if (!canAddStep) {
			return;
		}

		const firstActor = flowState.actorDrafts.find(
			(actor) => actor.trim().length > 0,
		);
		const nextSteps = [
			...flowState.stepDrafts,
			[firstActor ?? "", ""],
		];
		applyStructuredPatch([[CORE_FLOW_STEPS_FIELD_ID, nextSteps]]);
		setSelectedNodeId(`step:${nextSteps.length - 1}`);
	}

	function removeStep(index: number) {
		const nextSteps =
			flowState.stepDrafts.length > CORE_FLOW_MIN_STEPS
				? flowState.stepDrafts.filter((_, rowIndex) => rowIndex !== index)
				: flowState.stepDrafts.map((row, rowIndex) =>
						rowIndex === index ? ["", ""] : row,
					);
		applyStructuredPatch([[CORE_FLOW_STEPS_FIELD_ID, nextSteps]]);
		setSelectedNodeId("step:0");
	}

	function updateEnding(nextValue: string) {
		applyStructuredPatch([[CORE_FLOW_ENDING_FIELD_ID, nextValue]]);
	}

	async function saveCurrentMapImage() {
		if (!stageRef.current || !canSaveImage) {
			return;
		}

		setSavePhase("saving");
		setSaveMessage(null);

		const previousSelection = selectedNodeId;

		try {
			setSelectedNodeId(null);
			await reactFlowInstance?.fitView({
				padding: 0.18,
				duration: 0,
			});
			await new Promise((resolve) => window.setTimeout(resolve, 80));

			const dataUrl = await toPng(stageRef.current, {
				cacheBust: true,
				pixelRatio: 2.2,
			});
			const blob = await (await fetch(dataUrl)).blob();
			const storageId = await uploadBlob({
				blob,
				fileName: "core-flow-map.png",
				mimeType: "image/png",
				generateUploadUrl,
			});

			onFieldChange(CORE_FLOW_IMAGE_FIELD_ID, {
				kind: "upload",
				status: "stored",
				fileName: "core-flow-map.png",
				mimeType: "image/png",
				size: blob.size,
				storageId,
				previewUrl: dataUrl,
			});
			setSavePhase("saved");
			setSaveMessage("Current map image saved to lesson storage.");
		} catch {
			setSavePhase("error");
			setSaveMessage(
				"Image export failed. Use the Figma fallback or upload an external screenshot instead.",
			);
		} finally {
			setSelectedNodeId(previousSelection);
		}
	}

	async function uploadExternalFile(file: File) {
		setSavePhase("saving");
		setSaveMessage(null);

		try {
			const storageId = await uploadBlob({
				blob: file,
				fileName: file.name,
				mimeType: file.type || "image/png",
				generateUploadUrl,
			});

			onFieldChange(CORE_FLOW_IMAGE_FIELD_ID, {
				kind: "upload",
				status: "stored",
				fileName: file.name,
				mimeType: file.type || "image/png",
				size: file.size,
				storageId,
				previewUrl: URL.createObjectURL(file),
			});
			setSavePhase("saved");
			setSaveMessage("External screenshot saved as the lesson image.");
		} catch {
			setSavePhase("error");
			setSaveMessage("External screenshot upload failed. Try again.");
		}
	}

	const selectedActorValue =
		selectedKind === "actor" && selectedIndex !== null
			? flowState.actorDrafts[selectedIndex] ?? ""
			: "";
	const selectedStepValue =
		selectedKind === "step" && selectedIndex !== null
			? flowState.stepDrafts[selectedIndex] ?? ["", ""]
			: ["", ""];

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<TemplateDownloadCard lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
			<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
				<WorkbenchCard label="Core flow stage">
					<div className="space-y-3">
						<div className="flex flex-wrap items-center gap-2" data-export-ignore="true">
							<button
								type="button"
								onClick={addActor}
								disabled={!canAddActor}
								className={actionButtonClass}
							>
								Add actor
							</button>
							<button
								type="button"
								onClick={addStep}
								disabled={!canAddStep}
								className={actionButtonClass}
							>
								Add step
							</button>
							<button
								type="button"
								onClick={() =>
									reactFlowInstance?.fitView({
										padding: 0.18,
										duration: 240,
									})
								}
								className={actionButtonClass}
							>
								Fit view
							</button>
							<button
								type="button"
								onClick={saveCurrentMapImage}
								disabled={!canSaveImage || savePhase === "saving"}
								className={primaryActionButtonClass}
							>
								{savePhase === "saving" ? "Saving image..." : "Save image"}
							</button>
						</div>
						<div
							ref={stageRef}
							className={`sbs-core-flow-stage relative h-[34rem] overflow-hidden rounded-none border bg-product-surface-strong ${
								invalidFieldIds.has(CORE_FLOW_STEPS_FIELD_ID)
									? "border-[#a83232]"
									: "border-product-border/80"
							}`}
						>
							<ReactFlow
								nodes={nodes}
								edges={edges}
								nodeTypes={nodeTypes}
								nodesDraggable={false}
								nodesConnectable={false}
								elementsSelectable
								proOptions={{ hideAttribution: true }}
								panOnDrag
								panOnScroll
								zoomOnScroll
								fitView
								minZoom={0.45}
								maxZoom={1.5}
								onNodeClick={(_, node) => setSelectedNodeId(node.id)}
								onInit={setReactFlowInstance}
							>
								<Background
									gap={20}
									size={1}
									color="rgba(17, 17, 17, 0.08)"
								/>
							</ReactFlow>
						</div>
						<div className="flex flex-wrap gap-4 text-[11px] text-product-muted">
							<p>
								Actors: {flowState.validActorCount}/{CORE_FLOW_MAX_ACTORS}
							</p>
							<p>
								Steps: {flowState.filledStepCount}/{CORE_FLOW_MAX_STEPS}
							</p>
							<p>
								Ending: {flowState.endingDraft ? "defined" : "missing"}
							</p>
						</div>
						{invalidFieldIds.has(CORE_FLOW_STEPS_FIELD_ID) ? (
							<p className="text-[11px] font-medium text-[#a83232]">
								Map the flow in 5-7 complete steps before continuing.
							</p>
						) : null}
					</div>
				</WorkbenchCard>

				<div className="space-y-4">
					<WorkbenchCard label="Inspector">
						<div className="space-y-3">
							{selectedKind === "actor" && selectedIndex !== null ? (
								<>
									<label className="block">
										<span className={fieldLabelClass}>Actor name</span>
										<input
											autoFocus
											value={selectedActorValue}
											onChange={(event) =>
												updateActor(selectedIndex, event.target.value)
											}
											placeholder="Startup operators"
											className={inputBaseClass}
										/>
									</label>
									<button
										type="button"
										onClick={() => removeActor(selectedIndex)}
										disabled={flowState.actorDrafts.length === 0}
										className={actionButtonClass}
									>
										Remove actor
									</button>
								</>
							) : null}

							{selectedKind === "step" && selectedIndex !== null ? (
								<>
									<label className="block">
										<span className={fieldLabelClass}>Actor</span>
										<select
											value={selectedStepValue[0] ?? ""}
											onChange={(event) =>
												updateStep(selectedIndex, [
													event.target.value,
													selectedStepValue[1] ?? "",
												])
											}
											className={inputBaseClass}
										>
											<option value="">Choose actor</option>
											{flowState.actorDrafts.map((actor, index) => (
												<option key={`${actor}-${index}`} value={actor}>
													{actor.trim() || `Actor ${index + 1}`}
												</option>
											))}
										</select>
									</label>
									<label className="block">
										<span className={fieldLabelClass}>Step copy</span>
										<textarea
											value={selectedStepValue[1] ?? ""}
											onChange={(event) =>
												updateStep(selectedIndex, [
													selectedStepValue[0] ?? "",
													event.target.value,
												])
											}
											rows={4}
											placeholder="User pastes notes and gets a first draft."
											className={inputBaseClass}
										/>
									</label>
									<button
										type="button"
										onClick={() => removeStep(selectedIndex)}
										className={actionButtonClass}
									>
										{flowState.stepDrafts.length > CORE_FLOW_MIN_STEPS
											? "Remove step"
											: "Clear step"}
									</button>
								</>
							) : null}

							{selectedKind === "ending" ? (
								<label className="block">
									<span className={fieldLabelClass}>Value moment</span>
									<textarea
										autoFocus
										value={flowState.endingDraft}
										onChange={(event) => updateEnding(event.target.value)}
										rows={4}
										placeholder="They leave with a clean action summary they can send in minutes."
										className={`${inputBaseClass} ${
											invalidFieldIds.has(CORE_FLOW_ENDING_FIELD_ID)
												? "border-[#a83232]"
												: ""
										}`}
									/>
								</label>
							) : null}
						</div>
					</WorkbenchCard>

					<WorkbenchCard label="Saved artifact">
						<div className="space-y-3">
							<p className="text-xs leading-relaxed text-product-muted">
								Save the stage image here so later lessons can use the same
								core-flow artifact without leaving the app.
							</p>
							{saveMessage ? (
								<p
									className={`text-[11px] font-medium ${
										savePhase === "error"
											? "text-[#a83232]"
											: savePhase === "saved"
												? "text-product-accent"
												: "text-product-muted"
									}`}
								>
									{saveMessage}
								</p>
							) : savedImage?.fileName ? (
								<p className="text-[11px] font-medium text-product-accent">
									Saved image: {savedImage.fileName}
								</p>
							) : (
								<p className="text-[11px] font-medium text-product-muted">
									No saved image yet.
								</p>
							)}
							<div className="flex flex-wrap gap-2">
								<button
									type="button"
									onClick={() => externalUploadInputRef.current?.click()}
									className={actionButtonClass}
								>
									Upload external screenshot
								</button>
								<a
									href={lessonContent.workbench.templateDownloadHref}
									target="_blank"
									rel="noreferrer"
									className={actionButtonClass}
								>
									Use Figma instead
								</a>
							</div>
							<input
								ref={externalUploadInputRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={(event) => {
									const file = event.target.files?.[0];
									if (file) {
										void uploadExternalFile(file);
									}
									event.target.value = "";
								}}
							/>
							{savedImage?.previewUrl || savedImage?.url ? (
								<img
									src={savedImage.previewUrl ?? savedImage.url}
									alt={savedImage.fileName ?? "Saved core flow preview"}
									className={`w-full rounded-none border object-cover ${
										invalidFieldIds.has(CORE_FLOW_IMAGE_FIELD_ID)
											? "border-[#a83232]"
											: "border-product-border/80"
									}`}
								/>
							) : null}
							{invalidFieldIds.has(CORE_FLOW_IMAGE_FIELD_ID) ? (
								<p className="text-[11px] font-medium text-[#a83232]">
									Save the current map image before continuing.
								</p>
							) : null}
						</div>
					</WorkbenchCard>
				</div>
			</div>
		</WorkbenchContainer>
	);
}
