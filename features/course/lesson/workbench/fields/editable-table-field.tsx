import type {
	TableColumnConfig,
	WorkbenchField,
} from "@/features/course/lesson/model/manifest";
import { Button } from "@/components/ui/button";
import {
	assert,
	assertNever,
} from "@/features/course/lesson/lib/assert";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	createEmptyTableRow,
	getTableRows,
	isTableRowBlank,
} from "@/features/course/lesson/model/table";

import { fieldLabelClass } from "./field-styles";

function getColumnWidthClass(column: TableColumnConfig) {
	if (column.width === "compact") {
		return "min-w-[9rem]";
	}

	if (column.width === "wide") {
		return "min-w-[15rem]";
	}

	return "min-w-[11rem]";
}

function getDraftRows(value: unknown, columns: TableColumnConfig[]) {
	const rows = getTableRows(value, columns);
	return rows.length > 0 ? rows : [createEmptyTableRow(columns)];
}

function getStableOccurrenceKey(
	prefix: string,
	signature: string,
	counts: Map<string, number>,
) {
	const occurrence = counts.get(signature) ?? 0;
	counts.set(signature, occurrence + 1);
	return `${prefix}-${signature}-${occurrence}`;
}

function TableCellControl({
	field,
	column,
	rowIndex,
	value,
	onChange,
}: {
	field: WorkbenchField;
	column: TableColumnConfig;
	rowIndex: number;
	value: string;
	onChange: (value: string) => void;
}) {
	const controlName = `${field.id}-${rowIndex}-${column.id}`;

	switch (column.kind) {
		case "select": {
			assert(
				column.options,
				`Table column "${column.id}" is missing options.`,
			);

			return (
				<Select value={value} onValueChange={onChange}>
					<SelectTrigger
						aria-label={`${field.label} row ${rowIndex + 1} ${column.label}`}
						className="w-full border-0 bg-transparent px-3 py-2"
					>
						<SelectValue placeholder={column.placeholder ?? "Select one"} />
					</SelectTrigger>
					<SelectContent>
						{column.options.map((option) => (
							<SelectItem key={option} value={option}>
								{option}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			);
		}
		case "text":
			return (
				<Input
					type="text"
					name={controlName}
					aria-label={`${field.label} row ${rowIndex + 1} ${column.label}`}
					value={value}
					onChange={(event) => onChange(event.target.value)}
					placeholder={column.placeholder}
					className="border-0 bg-transparent px-3 py-2"
				/>
			);
	}

	return assertNever(column.kind, "Unhandled table column kind");
}

export function EditableTableField({
	field,
	value,
	onChange,
	showLabel = true,
}: {
	field: WorkbenchField;
	value: unknown;
	onChange: (value: unknown) => void;
	showLabel?: boolean;
}) {
	assert(field.columns?.length, `Table field "${field.id}" is missing columns.`);
	const columns = field.columns;
	const draftRows = getDraftRows(value, columns);
	const rowKeyCounts = new Map<string, number>();
	const rowEntries = draftRows.map((row, rowIndex) => ({
		row,
		rowIndex,
		rowKey: getStableOccurrenceKey(field.id, JSON.stringify(row), rowKeyCounts),
	}));

	function updateRows(nextRows: string[][]) {
		onChange(nextRows);
	}

	function updateCell(
		rowIndex: number,
		columnIndex: number,
		nextValue: string,
	) {
		const nextRows = draftRows.map((row, currentRowIndex) =>
			currentRowIndex === rowIndex
				? row.map((cell, currentColumnIndex) =>
						currentColumnIndex === columnIndex ? nextValue : cell,
					)
				: row,
		);

		updateRows(nextRows);
	}

	function addRow() {
		updateRows([...draftRows, createEmptyTableRow(columns)]);
	}

	function removeRow(rowIndex: number) {
		const nextRows = draftRows.filter(
			(_, currentRowIndex) => currentRowIndex !== rowIndex,
		);
		updateRows(nextRows);
	}

	return (
		<div className="block">
			{showLabel ? (
				<span className={fieldLabelClass}>{field.label}</span>
			) : null}
			<div className={showLabel ? "mt-1.5 space-y-3" : "space-y-3"}>
				<div className="hidden overflow-x-auto rounded-none border border-product-border/80 bg-product-surface md:block">
					<table className="w-full border-collapse text-left">
						<thead>
							<tr className="border-b border-product-border/80 bg-product-surface-strong/70">
								{columns.map((column) => (
									<th
										key={column.id}
										scope="col"
										className={`border-r border-product-border/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted last:border-r-0 ${getColumnWidthClass(column)}`}
									>
										{column.label}
									</th>
								))}
								<th
									scope="col"
									className="w-[1%] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{rowEntries.map(({ row, rowIndex, rowKey }) => (
								<tr
									key={rowKey}
									className="border-b border-product-border/70 last:border-b-0"
								>
									{columns.map((column, columnIndex) => (
										<td
											key={column.id}
											className="border-r border-product-border/70 align-top last:border-r-0"
										>
											<TableCellControl
												field={field}
												column={column}
												rowIndex={rowIndex}
												value={row[columnIndex]}
												onChange={(nextValue) =>
													updateCell(rowIndex, columnIndex, nextValue)
												}
											/>
										</td>
									))}
									<td className="align-top">
										<Button
											type="button"
											onClick={() => removeRow(rowIndex)}
											aria-label={`Remove row ${rowIndex + 1} from ${field.label}`}
											variant="outline"
											size="sm"
											className="m-2"
										>
											Remove
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="space-y-3 md:hidden">
					{rowEntries.map(({ row, rowIndex, rowKey }) => (
						<div
							key={`mobile-${rowKey}`}
							className="rounded-none border border-product-border/80 bg-product-surface p-3"
						>
							<div className="mb-3 flex items-center justify-between gap-3">
								<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
									Row {rowIndex + 1}
								</p>
								<Button
									type="button"
									onClick={() => removeRow(rowIndex)}
									aria-label={`Remove row ${rowIndex + 1} from ${field.label}`}
									variant="outline"
									size="sm"
								>
									Remove
								</Button>
							</div>
							<div className="space-y-3">
								{columns.map((column, columnIndex) => (
									<div key={column.id} className="block">
										<span className={fieldLabelClass}>{column.label}</span>
										<div className="mt-1.5 rounded-none border border-product-border/80 bg-product-surface-strong/70">
											<TableCellControl
												field={field}
												column={column}
												rowIndex={rowIndex}
												value={row[columnIndex]}
												onChange={(nextValue) =>
													updateCell(rowIndex, columnIndex, nextValue)
												}
											/>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
				<div className="flex justify-start">
					<Button type="button" onClick={addRow} variant="outline" size="sm">
						Add Row
					</Button>
				</div>
				{draftRows.length === 1 && isTableRowBlank(draftRows[0]) ? (
					<p className="text-[11px] font-medium leading-relaxed text-product-muted">
						Add the first row when you find a useful data point.
					</p>
				) : null}
			</div>
		</div>
	);
}
