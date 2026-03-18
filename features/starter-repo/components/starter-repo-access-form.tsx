"use client";

import { useMutation } from "convex/react";
import { type FormEvent, useEffect, useState } from "react";

import { api } from "@/convex/_generated/api";
import { validateGitHubUsername } from "@/features/starter-repo/lib/github-username";

export function StarterRepoAccessForm({
	initialUsername,
	onSubmitted,
}: {
	initialUsername: string;
	onSubmitted?: () => void;
}) {
	const requestStarterRepoAccess = useMutation(
		api.course.requestStarterRepoAccess,
	);
	const [githubUsername, setGitHubUsername] = useState(initialUsername);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setGitHubUsername(initialUsername);
	}, [initialUsername]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const { normalized, error } = validateGitHubUsername(githubUsername);
		if (error) {
			setSubmitError(error);
			return;
		}

		setIsSubmitting(true);
		setSubmitError(null);

		try {
			await requestStarterRepoAccess({ githubUsername: normalized });
			onSubmitted?.();
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: "Unable to save the GitHub username right now.",
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form className="mt-4 space-y-3" onSubmit={handleSubmit}>
			<label className="block">
				<span className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
					GitHub username
				</span>
				<input
					type="text"
					value={githubUsername}
					onChange={(event) => setGitHubUsername(event.target.value)}
					placeholder="parkerrex"
					autoCapitalize="none"
					autoCorrect="off"
					spellCheck={false}
					className="mt-2 w-full rounded-none border border-product-border bg-product-surface px-3 py-3 text-sm text-product-text outline-none transition-colors focus:border-product-accent"
				/>
			</label>
			<p className="text-xs leading-relaxed text-product-muted">
				Use the GitHub username that should receive access to the private
				starter repo.
			</p>
			{submitError ? (
				<p className="text-xs leading-relaxed text-danger">{submitError}</p>
			) : null}
			<button
				type="submit"
				disabled={isSubmitting}
				className="inline-flex rounded-none border border-product-accent bg-product-chip px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg disabled:cursor-not-allowed disabled:border-product-border disabled:bg-product-surface disabled:text-product-muted"
			>
				{isSubmitting ? "Saving..." : "Save GitHub username"}
			</button>
		</form>
	);
}
