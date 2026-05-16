"use client";

import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type {
	StarterPreviewDraft,
	StarterPreviewSection,
} from "./StarterPreviewTypes";

export function StarterPreviewFoundationFields({
	section,
	draft,
}: {
	readonly section: StarterPreviewSection;
	readonly draft: StarterPreviewDraft;
}) {
	const productName = section.foundation.fields.productName;
	const productSummary = section.foundation.fields.productSummary;
	const primaryUser = section.foundation.fields.primaryUser;

	return (
		<div className="grid gap-3 sm:grid-cols-2">
			<StarterPreviewField
				label={productName.label}
				helper={productName.helperText}
			>
				<Input
					data-testid="codebase-demo-input-product_name"
					value={draft.fields.product_name}
					placeholder={productName.placeholder}
					onChange={(event) =>
						draft.setFoundationField("product_name", event.target.value)
					}
				/>
			</StarterPreviewField>
			<StarterPreviewField
				label={primaryUser.label}
				helper={primaryUser.helperText}
			>
				<Input
					data-testid="codebase-demo-input-primary_user"
					value={draft.fields.primary_user}
					placeholder={primaryUser.placeholder}
					onChange={(event) =>
						draft.setFoundationField("primary_user", event.target.value)
					}
				/>
			</StarterPreviewField>
			<StarterPreviewField
				label={productSummary.label}
				helper={productSummary.helperText}
				className="sm:col-span-2"
			>
				<Textarea
					data-testid="codebase-demo-input-product_summary"
					value={draft.fields.product_summary}
					placeholder={productSummary.placeholder}
					onChange={(event) =>
						draft.setFoundationField("product_summary", event.target.value)
					}
					rows={2}
				/>
			</StarterPreviewField>
		</div>
	);
}

function StarterPreviewField({
	label,
	helper,
	className,
	children,
}: {
	readonly label: string;
	readonly helper: string;
	readonly className?: string;
	readonly children: ReactNode;
}) {
	return (
		<label className={className}>
			<span className="text-sm font-medium text-foreground">{label}</span>
			<span className="mt-1 block">{children}</span>
			<span className="mt-1 block text-xs leading-5 text-muted-foreground">
				{helper}
			</span>
		</label>
	);
}
