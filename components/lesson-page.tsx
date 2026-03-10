"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import type { WorkbenchField } from "@/app/lessonRegistry";
import { api } from "@/convex/_generated/api";
import { ProductShell } from "@/components/product-shell";
import { ViewerGate } from "@/components/viewer-gate";

function toLineList(value: unknown) {
	if (!Array.isArray(value)) {
		return "";
	}

	return value
		.map((item) => String(item))
		.join("\n");
}

function toTableText(value: unknown) {
	if (!Array.isArray(value)) {
		return "";
	}

	return value
		.map((row) => (Array.isArray(row) ? row.join(" | ") : String(row)))
		.join("\n");
}

function parseLines(value: string) {
	return value
		.split("\n")
		.map((item) => item.trim())
		.filter(Boolean);
}

function parseTable(value: string) {
	return value
		.split("\n")
		.map((row) =>
			row
				.split("|")
				.map((column) => column.trim())
				.filter(Boolean),
		)
		.filter((row) => row.length > 0);
}

export function LessonPage({
	lessonId,
}: {
	lessonId: string;
}) {
	const router = useRouter();
	const { isAuthenticated } = useConvexAuth();
	const lessonState = useQuery(
		api.course.getLessonState,
		isAuthenticated ? { lessonId } : "skip",
	) as
		| {
				lesson: {
					id: string;
					title: string;
					shortTitle: string;
					objectiveTitle: string;
					helperText?: string;
					winCondition: string;
					checklist: string[];
					artifact: { label: string };
					prevLessonId?: string;
					workbenchFields?: WorkbenchField[];
				};
				fieldValues: Record<string, unknown>;
				status: string;
				pinnedArtifacts: Array<{
					artifactKey: string;
					artifactLabel: string;
					fields: Array<[string, unknown]>;
					lessonTitle: string;
				}>;
				isImplemented: boolean;
		  }
		| undefined;
	const saveLessonDraft = useMutation(api.course.saveLessonDraft);
	const completeLesson = useMutation(api.course.completeLesson);
	const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({});
	const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "saving" | "error">(
		"idle",
	);
	const initializedForLessonId = useRef<string | null>(null);
	const lastSavedSnapshot = useRef("");

	useEffect(() => {
		if (!lessonState) {
			return;
		}

		if (initializedForLessonId.current !== lessonId) {
			const nextValues = lessonState.fieldValues ?? {};
			setFieldValues(nextValues);
			initializedForLessonId.current = lessonId;
			lastSavedSnapshot.current = JSON.stringify(nextValues);
			setSaveStatus("idle");
		}
	}, [lessonId, lessonState]);

	useEffect(() => {
		if (!lessonState || initializedForLessonId.current !== lessonId) {
			return;
		}

		const snapshot = JSON.stringify(fieldValues);
		if (snapshot === lastSavedSnapshot.current) {
			return;
		}

		setSaveStatus("saving");

		const timeout = window.setTimeout(() => {
			void saveLessonDraft({ lessonId, fieldValues }).then(
				() => {
					lastSavedSnapshot.current = JSON.stringify(fieldValues);
					setSaveStatus("saved");
				},
				() => {
					setSaveStatus("error");
				},
			);
		}, 650);

		return () => window.clearTimeout(timeout);
	}, [fieldValues, lessonId, lessonState, saveLessonDraft]);

	if (lessonState === undefined) {
		return (
			<ProductShell title="Lesson" subtitle="Loading lesson state.">
				<ViewerGate>
					<section className="border border-line bg-white px-5 py-10 shadow-card">
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/60">
							Loading lesson
						</p>
					</section>
				</ViewerGate>
			</ProductShell>
		);
	}

	const { lesson, pinnedArtifacts, isImplemented } = lessonState;

	const setValue = (fieldId: string, value: unknown) => {
		setFieldValues((current) => ({
			...current,
			[fieldId]: value,
		}));
	};

	const renderField = (field: WorkbenchField) => {
		const linkedArtifact = field.linkedArtifactKey
			? pinnedArtifacts.find(
					(artifact: { artifactKey: string }) =>
						artifact.artifactKey === field.linkedArtifactKey,
			  )
			: null;
		const currentValue = fieldValues[field.id];

		if (field.kind === "readonly") {
			return (
				<div className="border border-line bg-paper p-4">
					<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/55">
						{field.label}
					</p>
					<div className="mt-3 text-sm font-medium text-ink/75">
						{linkedArtifact ? (
							linkedArtifact.fields.length === 0 ? (
								<p>{linkedArtifact.artifactLabel}</p>
							) : (
								linkedArtifact.fields.map(
									([entryKey, entryValue]: [string, unknown]) => (
										<div key={entryKey} className="mt-3">
											<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/55">
												{entryKey.replaceAll("_", " ")}
											</p>
											<p className="mt-1 break-words">
												{Array.isArray(entryValue)
													? JSON.stringify(entryValue)
													: String(entryValue)}
											</p>
										</div>
									),
								)
							)
						) : (
							<p>This field will populate from an earlier saved artifact.</p>
						)}
					</div>
				</div>
			);
		}

		if (field.kind === "text" || field.kind === "url") {
			return (
				<label className="block">
					<span className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
						{field.label}
					</span>
					<input
						type={field.kind === "url" ? "url" : "text"}
						value={typeof currentValue === "string" ? currentValue : ""}
						onChange={(event) => setValue(field.id, event.target.value)}
						placeholder={field.placeholder}
						className="mt-2 w-full border border-line bg-white px-4 py-3 text-base font-medium text-ink outline-none focus:border-ink"
					/>
				</label>
			);
		}

		if (field.kind === "number") {
			return (
				<label className="block">
					<span className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
						{field.label}
					</span>
					<input
						type="number"
						value={typeof currentValue === "number" ? currentValue : ""}
						onChange={(event) =>
							setValue(field.id, Number(event.target.value) || 0)
						}
						className="mt-2 w-full border border-line bg-white px-4 py-3 text-base font-medium text-ink outline-none focus:border-ink"
					/>
				</label>
			);
		}

		if (field.kind === "toggle") {
			return (
				<label className="flex items-center justify-between border border-line bg-paper px-4 py-3">
					<span className="text-sm font-semibold uppercase tracking-[0.12em] text-ink/75">
						{field.label}
					</span>
					<input
						type="checkbox"
						checked={Boolean(currentValue)}
						onChange={(event) => setValue(field.id, event.target.checked)}
						className="size-5 accent-ink"
					/>
				</label>
			);
		}

		if (field.kind === "select") {
			return (
				<label className="block">
					<span className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
						{field.label}
					</span>
					<select
						value={typeof currentValue === "string" ? currentValue : ""}
						onChange={(event) => setValue(field.id, event.target.value)}
						className="mt-2 w-full border border-line bg-white px-4 py-3 text-base font-medium text-ink outline-none focus:border-ink"
					>
						<option value="">Select one</option>
						{field.options?.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</label>
			);
		}

		if (field.kind === "checklist" || field.kind === "board") {
			return (
				<label className="block">
					<span className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
						{field.label}
					</span>
					<textarea
						value={toLineList(currentValue)}
						onChange={(event) => setValue(field.id, parseLines(event.target.value))}
						rows={field.rows ?? 6}
						placeholder="One item per line"
						className="mt-2 w-full border border-line bg-white px-4 py-3 text-base font-medium text-ink outline-none focus:border-ink"
					/>
				</label>
			);
		}

		if (field.kind === "table") {
			return (
				<label className="block">
					<span className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
						{field.label}
					</span>
					<textarea
						value={toTableText(currentValue)}
						onChange={(event) => setValue(field.id, parseTable(event.target.value))}
						rows={6}
						placeholder="One row per line. Separate columns with |"
						className="mt-2 w-full border border-line bg-white px-4 py-3 font-mono text-sm text-ink outline-none focus:border-ink"
					/>
					<p className="mt-2 text-xs font-medium text-ink/55">
						Use `|` between columns. {field.helpText ?? ""}
					</p>
				</label>
			);
		}

		if (field.kind === "textarea") {
			return (
				<label className="block">
					<span className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
						{field.label}
					</span>
					<textarea
						value={typeof currentValue === "string" ? currentValue : ""}
						onChange={(event) => setValue(field.id, event.target.value)}
						rows={field.rows ?? 5}
						placeholder={field.placeholder}
						className="mt-2 w-full border border-line bg-white px-4 py-3 text-base font-medium text-ink outline-none focus:border-ink"
					/>
				</label>
			);
		}

		return (
			<div className="border border-dashed border-line bg-paper p-4">
				<p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink/70">
					{field.label}
				</p>
				<p className="mt-2 text-sm font-medium text-ink/65">
					{field.kind} fields are deferred to the next pass.
				</p>
			</div>
		);
	};

	return (
		<ProductShell
			title={`${lesson.id} ${lesson.shortTitle}`}
			subtitle={lesson.objectiveTitle}
		>
			<ViewerGate>
				<div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
					<aside className="border border-line bg-white p-5 shadow-card">
						<p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
							Current objective
						</p>
						<h2 className="mt-3 font-display text-4xl uppercase leading-none tracking-[0.04em]">
							{lesson.title}
						</h2>
						<p className="mt-3 text-sm font-medium leading-relaxed text-ink/75">
							{lesson.helperText ?? lesson.winCondition}
						</p>

						<div className="mt-5">
							<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/55">
								Checklist
							</p>
							<ul className="mt-3 space-y-2 text-sm font-medium text-ink/80">
								{lesson.checklist.map((item: string) => (
									<li key={item}>[ ] {item}</li>
								))}
							</ul>
						</div>

						<div className="mt-5 border border-line bg-paper p-4">
							<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/55">
								Output
							</p>
							<p className="mt-2 text-sm font-semibold text-ink/80">
								{lesson.artifact.label}
							</p>
						</div>

						<div className="mt-5 flex flex-wrap gap-3">
							{lesson.prevLessonId ? (
								<Link
									href={`/lesson/${lesson.prevLessonId}`}
									className="inline-flex border border-line bg-white px-3 py-2 font-display text-xl uppercase tracking-[0.04em] text-ink"
								>
									Back
								</Link>
							) : null}
							<Link
								href="/mission"
								className="inline-flex border border-line bg-white px-3 py-2 font-display text-xl uppercase tracking-[0.04em] text-ink"
							>
								Mission
							</Link>
						</div>
					</aside>

					<section className="border border-line bg-white p-5 shadow-card">
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div>
								<p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
									Workbench
								</p>
								<h1 className="mt-2 font-display text-4xl uppercase leading-none tracking-[0.04em]">
									{lesson.title}
								</h1>
							</div>
							<div className="text-right text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
								<p>Status: {lessonState.status.replace("_", " ")}</p>
								<p className="mt-2">
									Autosave: {saveStatus === "idle" ? "Ready" : saveStatus}
								</p>
							</div>
						</div>

						{isImplemented ? null : (
							<div className="mt-4 border border-dashed border-line bg-paper p-4 text-sm font-medium text-ink/70">
								This lesson includes field types from the next pass, so this
								screen is only partially implemented right now.
							</div>
						)}

						<div className="mt-6 space-y-5">
							{(lesson.workbenchFields ?? []).map((field: WorkbenchField) => (
								<div key={field.id}>
									{renderField(field)}
									{field.helpText ? (
										<p className="mt-2 text-xs font-medium text-ink/55">
											{field.helpText}
										</p>
									) : null}
								</div>
							))}
						</div>

						<div className="mt-8 flex flex-wrap gap-3">
							<button
								type="button"
								onClick={() => {
									setSaveStatus("saving");
									void saveLessonDraft({ lessonId, fieldValues }).then(
										() => {
											lastSavedSnapshot.current = JSON.stringify(fieldValues);
											setSaveStatus("saved");
										},
										() => {
											setSaveStatus("error");
										},
									);
								}}
								className="border border-line bg-white px-4 py-3 font-display text-2xl uppercase tracking-[0.04em] text-ink"
							>
								Save Draft
							</button>
							<button
								type="button"
								disabled={!isImplemented}
								onClick={() => {
									void completeLesson({ lessonId, fieldValues }).then(
											(result: { nextLessonId: string | null }) => {
											if (result.nextLessonId) {
												router.push(`/lesson/${result.nextLessonId}`);
												return;
											}

											router.push("/mission");
										},
										() => {
											setSaveStatus("error");
										},
									);
								}}
								className="border border-line bg-ink px-4 py-3 font-display text-2xl uppercase tracking-[0.04em] text-paper disabled:cursor-not-allowed disabled:bg-ink/50"
							>
								Complete Lesson
							</button>
						</div>
					</section>

					<aside className="border border-line bg-white p-5 shadow-card">
						<p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
							Pinned artifacts
						</p>
						<div className="mt-4 space-y-4">
							{pinnedArtifacts.length === 0 ? (
								<p className="text-sm font-medium text-ink/70">
									No pinned artifacts are needed for this lesson yet.
								</p>
							) : (
								pinnedArtifacts.map(
									(artifact: {
										artifactKey: string;
										artifactLabel: string;
										fields: Array<[string, unknown]>;
										lessonTitle: string;
									}) => (
										<div
											key={artifact.artifactKey}
											className="border border-line bg-paper p-4"
										>
											<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/55">
												{artifact.lessonTitle}
											</p>
											<p className="mt-2 font-semibold text-ink/85">
												{artifact.artifactLabel}
											</p>
											<div className="mt-3 space-y-2 text-sm font-medium text-ink/75">
												{artifact.fields.length === 0 ? (
													<p>No preview yet.</p>
												) : (
													artifact.fields.slice(0, 3).map(([fieldId, value]) => (
														<div key={fieldId}>
															<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/55">
																{fieldId.replaceAll("_", " ")}
															</p>
															<p className="mt-1 break-words">
																{Array.isArray(value)
																	? JSON.stringify(value)
																	: String(value)}
															</p>
														</div>
													))
												)}
											</div>
										</div>
									),
								)
							)}
						</div>
					</aside>
				</div>
			</ViewerGate>
		</ProductShell>
	);
}
