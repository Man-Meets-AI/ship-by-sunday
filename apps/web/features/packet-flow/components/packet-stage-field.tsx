"use client";

import type { ChangeEvent } from "react";
import type { CanonicalProjectFactKey } from "@packet-compiler";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	packetFieldInputKind,
	packetFieldLabel,
} from "@/features/packet-flow/lib/packet-field-helpers";

export function PacketStageField({
	fieldKey,
	value,
	onChange,
}: {
	fieldKey: CanonicalProjectFactKey;
	value: string;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
}) {
	const kind = packetFieldInputKind(fieldKey);
	const handleChange = (
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		onChange(fieldKey, event.target.value);
	};

	return (
		<div className="space-y-2">
			<Label htmlFor={fieldKey}>{packetFieldLabel(fieldKey)}</Label>
			{kind === "textarea" ? (
				<Textarea
					id={fieldKey}
					value={value}
					onChange={handleChange}
					rows={fieldKey === "section_narrative" ? 6 : 4}
				/>
			) : (
				<Input
					id={fieldKey}
					type={kind === "number" ? "number" : "text"}
					value={value}
					onChange={handleChange}
				/>
			)}
		</div>
	);
}
