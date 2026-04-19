function normalizeCell(value) {
	return String(value ?? "");
}

export function stringifyCsv({ headers, rows }) {
	const lines = [headers.join(",")];

	for (const row of rows) {
		lines.push(
			headers
				.map((header) => escapeCsvCell(normalizeCell(row[header])))
				.join(","),
		);
	}

	return `${lines.join("\n")}\n`;
}

function escapeCsvCell(value) {
	if (/[",\n\r]/.test(value)) {
		return `"${value.replaceAll('"', '""')}"`;
	}

	return value;
}

export function parseCsv(text) {
	const rows = [];
	const normalized = text.replaceAll("\r\n", "\n");
	let currentCell = "";
	let currentRow = [];
	let insideQuotes = false;

	for (let index = 0; index < normalized.length; index += 1) {
		const char = normalized[index];
		const nextChar = normalized[index + 1];

		if (insideQuotes) {
			if (char === '"' && nextChar === '"') {
				currentCell += '"';
				index += 1;
				continue;
			}

			if (char === '"') {
				insideQuotes = false;
				continue;
			}

			currentCell += char;
			continue;
		}

		if (char === '"') {
			insideQuotes = true;
			continue;
		}

		if (char === ",") {
			currentRow.push(currentCell);
			currentCell = "";
			continue;
		}

		if (char === "\n") {
			currentRow.push(currentCell);
			if (currentRow.some((cell) => cell.length > 0)) {
				rows.push(currentRow);
			}
			currentRow = [];
			currentCell = "";
			continue;
		}

		currentCell += char;
	}

	if (currentCell.length > 0 || currentRow.length > 0) {
		currentRow.push(currentCell);
		rows.push(currentRow);
	}

	if (rows.length === 0) {
		return { headers: [], records: [] };
	}

	const [headers, ...dataRows] = rows;
	const malformedRows = dataRows
		.map((row, index) => ({
			cellCount: row.length,
			headersCount: headers.length,
			lineNumber: index + 2,
			row,
		}))
		.filter((detail) => detail.cellCount !== detail.headersCount);
	const records = dataRows.map((row) =>
		Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])),
	);

	return { headers, malformedRows, records };
}
