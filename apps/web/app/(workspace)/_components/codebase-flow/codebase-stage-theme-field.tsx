"use client";

import dynamic from "next/dynamic";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/codebase-compiler";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import type { CodebaseThemeConfiguratorProps } from "@/app/(workspace)/_components/codebase-flow/codebase-theme-configurator";
import {
	codebaseFieldHelperText,
	codebaseFieldLabel,
} from "@/lib/codebase-flow/codebase-field-helpers";

const CodebaseThemeConfigurator = dynamic<CodebaseThemeConfiguratorProps>(
	() =>
		import("@/app/(workspace)/_components/codebase-flow/codebase-theme-configurator").then(
			(module) => module.CodebaseThemeConfigurator,
		),
	{ loading: ThemeConfiguratorSkeleton },
);

function ThemeConfiguratorSkeleton() {
	return (
		<div className="grid items-start gap-6 lg:grid-cols-[1fr_minmax(300px,360px)]">
			<div className="flex flex-col gap-6">
				<Skeleton className="h-24 w-full rounded-xl" />
				<Skeleton className="h-12 w-full rounded-xl" />
				<div className="grid grid-cols-2 gap-4">
					<Skeleton className="h-20 w-full rounded-xl" />
					<Skeleton className="h-20 w-full rounded-xl" />
				</div>
			</div>
			<Skeleton className="h-72 w-full rounded-xl" />
		</div>
	);
}

export function CodebaseStageThemeField({
	errorMessage,
	facts,
	fieldKey,
	onChange,
	value,
}: {
	errorMessage?: string;
	facts: CanonicalProjectFactsDraft;
	fieldKey: CanonicalProjectFactKey;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	value: string;
}) {
	const helperText = codebaseFieldHelperText(fieldKey, facts);

	return (
		<Field className="gap-2.5" data-invalid={errorMessage ? true : undefined}>
			<FieldLabel>{codebaseFieldLabel(fieldKey, facts)}</FieldLabel>
			<FieldContent>
				<CodebaseThemeConfigurator
					value={value}
					onChange={(nextValue) => onChange(fieldKey, nextValue)}
				/>
				{helperText ? <FieldDescription>{helperText}</FieldDescription> : null}
				<FieldError>{errorMessage}</FieldError>
			</FieldContent>
		</Field>
	);
}
