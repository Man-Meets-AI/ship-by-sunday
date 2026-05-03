"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { StarterRepoAccessSurface } from "@/config/starter-repo-access-copy";
import { api } from "@/convex/_generated/api";
import { validateGitHubUsername } from "@/lib/github-username";

export function StarterRepoAccessForm({
	initialUsername,
	onSubmitted,
	surface,
}: {
	initialUsername: string;
	onSubmitted?: () => void;
	surface: StarterRepoAccessSurface;
}) {
	const requestStarterRepoAccess = useMutation(
		api.course.requestStarterRepoAccess,
	);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const hintId = useId();
	const validationErrorId = useId();
	const submitErrorId = useId();

	const form = useForm({
		defaultValues: {
			githubUsername: initialUsername,
		},
		onSubmit: async ({ value }) => {
			const { normalized, error } = validateGitHubUsername(
				value.githubUsername,
			);
			if (error) {
				throw new Error(error);
			}

			await requestStarterRepoAccess({ githubUsername: normalized });
			if (surface === "mission") {
				toast.success(
					"Starter repo request saved. Watch for the GitHub invite.",
				);
			}
			onSubmitted?.();
		},
		onSubmitInvalid: () => {
			setSubmitError(null);
		},
	});

	useEffect(() => {
		form.setFieldValue("githubUsername", initialUsername);
	}, [form, initialUsername]);

	return (
		<form
			className="space-y-3"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				setSubmitError(null);
				void form.handleSubmit().catch((error: unknown) => {
					setSubmitError(
						error instanceof Error
							? error.message
							: "Unable to save the GitHub username right now.",
					);
				});
			}}
		>
			<form.Field
				name="githubUsername"
				validators={{
					onChange: ({ value }) => validateGitHubUsername(value).error,
					onSubmit: ({ value }) => validateGitHubUsername(value).error,
				}}
			>
				{(field) => {
					const errors = field.state.meta.errors
						.map((error) => (typeof error === "string" ? error : null))
						.filter((error): error is string => Boolean(error));
					const describedBy = [
						hintId,
						errors.length > 0 ? validationErrorId : null,
						submitError ? submitErrorId : null,
					]
						.filter(Boolean)
						.join(" ");
					return (
						<Field>
							<FieldLabel htmlFor={field.name}>GitHub username</FieldLabel>
							<FieldContent>
								<Input
									id={field.name}
									type="text"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => {
										setSubmitError(null);
										field.handleChange(event.target.value);
									}}
									placeholder="parkerrex"
									autoCapitalize="none"
									autoCorrect="off"
									spellCheck={false}
									aria-invalid={errors.length > 0}
									aria-describedby={describedBy || undefined}
								/>
								<FieldDescription id={hintId}>
									Use the GitHub username that should receive access to the
									private starter repo.
								</FieldDescription>
								{errors.length > 0 ? (
									<FieldError id={validationErrorId}>{errors[0]}</FieldError>
								) : null}
							</FieldContent>
						</Field>
					);
				}}
			</form.Field>
			{submitError ? (
				<Alert id={submitErrorId} variant="destructive">
					<AlertDescription>{submitError}</AlertDescription>
				</Alert>
			) : null}
			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button
						type="submit"
						variant="secondary"
						size="sm"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Saving..." : "Save GitHub username"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
