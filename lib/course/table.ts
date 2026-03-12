import type { TableColumnConfig } from "./contracts";

export type LabeledTableRow = Record<string, string>;

function normalizeCellValue(value: unknown) {
	if (typeof value === "string") {
		return value;
	}

	if (value === null || value === undefined) {
		return "";
	}

	return String(value);
}

function getColumnCount(columns?: TableColumnConfig[], value?: unknown) {
	if (columns && columns.length > 0) {
		return columns.length;
	}

	if (!Array.isArray(value)) {
		return 0;
	}

	return value.reduce((max, row) => {
		if (!Array.isArray(row)) {
			return max;
		}

		return Math.max(max, row.length);
	}, 0);
}

function normalizeRow(row: unknown, columnCount: number) {
	const cells = Array.isArray(row) ? row.map(normalizeCellValue) : [];

	if (columnCount === 0) {
		return cells;
	}

	return Array.from({ length: columnCount }, (_, index) => cells[index] ?? "");
}

export function createEmptyTableRow(
	columnsOrCount: TableColumnConfig[] | number,
) {
	const count = Array.isArray(columnsOrCount)
		? columnsOrCount.length
		: columnsOrCount;

	return Array.from({ length: count }, () => "");
}

export function getTableRows(value: unknown, columns?: TableColumnConfig[]) {
	const columnCount = getColumnCount(columns, value);

	if (!Array.isArray(value)) {
		return [];
	}

	return value
		.filter((row): row is unknown[] => Array.isArray(row))
		.map((row) => normalizeRow(row, columnCount));
}

export function isTableRowBlank(row: string[]) {
	return row.every((cell) => cell.trim().length === 0);
}

export function getFilledTableRows(
	value: unknown,
	columns?: TableColumnConfig[],
) {
	return getTableRows(value, columns).filter((row) => !isTableRowBlank(row));
}

export function isTableValueFilled(
	value: unknown,
	columns?: TableColumnConfig[],
) {
	return getFilledTableRows(value, columns).length > 0;
}

export function getLabeledTableRows(
	value: unknown,
	columns?: TableColumnConfig[],
): LabeledTableRow[] {
	if (!columns || columns.length === 0) {
		return [];
	}

	return getFilledTableRows(value, columns).map((row) =>
		Object.fromEntries(
			columns.map((column, index) => [column.id, row[index] ?? ""]),
		),
	);
}

export function formatTablePreview(
	value: unknown,
	columns?: TableColumnConfig[],
	limit = 3,
) {
	const rows = getFilledTableRows(value, columns);

	if (rows.length === 0) {
		return "No rows saved yet.";
	}

	const rowSummaries = rows.slice(0, limit).map((row) => {
		if (!columns || columns.length === 0) {
			return row.filter((cell) => cell.trim().length > 0).join(" | ");
		}

		return columns
			.map((column, index) => {
				const cell = row[index] ?? "";
				if (cell.trim().length === 0) {
					return null;
				}

				return `${column.label}: ${cell}`;
			})
			.filter((cell): cell is string => Boolean(cell))
			.join(" | ");
	});

	const rowLabel = rows.length === 1 ? "row" : "rows";
	const suffix = rows.length > limit ? `; +${rows.length - limit} more` : "";

	return `${rows.length} ${rowLabel}: ${rowSummaries.join("; ")}${suffix}`;
}

export function parseLegacyTableText(value: string) {
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

export function toLegacyTableText(
	value: unknown,
	columns?: TableColumnConfig[],
) {
	return getFilledTableRows(value, columns)
		.map((row) => row.join(" | "))
		.join("\n");
}
