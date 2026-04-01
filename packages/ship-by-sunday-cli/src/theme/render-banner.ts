import { paint, paintAnsi, type CliRenderOptions } from "./render-theme";

const baseBackgroundStyle = "48;2;12;15;8";
const wordmarkStyle = `${baseBackgroundStyle};1;38;2;210;198;108`;
const shipBySundayLogoLines = [
	"███████ ██   ██ ██ ██████      ██████  ██    ██     ███████ ██    ██ ███    ██ ██████   █████  ██    ██ ",
	"██      ██   ██ ██ ██   ██     ██   ██  ██  ██      ██      ██    ██ ████   ██ ██   ██ ██   ██  ██  ██  ",
	"███████ ███████ ██ ██████      ██████    ████       ███████ ██    ██ ██ ██  ██ ██   ██ ███████   ████   ",
	"     ██ ██   ██ ██ ██          ██   ██    ██             ██ ██    ██ ██  ██ ██ ██   ██ ██   ██    ██    ",
	"███████ ██   ██ ██ ██          ██████     ██        ███████  ██████  ██   ████ ██████  ██   ██    ██    ",
];

type RgbColor = {
	blue: number;
	green: number;
	red: number;
};

const patternColors: RgbColor[] = [
	{ red: 20, green: 24, blue: 10 },
	{ red: 42, green: 50, blue: 16 },
	{ red: 71, green: 81, blue: 24 },
	{ red: 101, green: 112, blue: 31 },
	{ red: 136, green: 145, blue: 39 },
	{ red: 177, green: 169, blue: 58 },
];

const monochromePatternCharacters = ["░", "░", "▒", "▓", "█"];

function buildPatternTail(
	width: number,
	rowIndex: number,
	options: CliRenderOptions,
) {
	if (width <= 0) {
		return "";
	}

	if (!options.colorEnabled) {
		let patternTail = "";
		for (let columnIndex = 0; columnIndex < width; columnIndex += 1) {
			const intensity = getPatternIntensity(width, rowIndex, columnIndex);
			const characterIndex = Math.min(
				monochromePatternCharacters.length - 1,
				Math.floor(intensity * monochromePatternCharacters.length),
			);
			patternTail += monochromePatternCharacters[characterIndex]!;
		}
		return patternTail;
	}

	let patternTail = "";
	let currentStyle = "";
	let currentSegmentWidth = 0;

	for (let columnIndex = 0; columnIndex < width; columnIndex += 1) {
		const style = getPatternCellStyle(
			getPatternIntensity(width, rowIndex, columnIndex),
		);

		if (style === currentStyle) {
			currentSegmentWidth += 1;
			continue;
		}

		if (currentSegmentWidth > 0) {
			patternTail += paintAnsi(
				" ".repeat(currentSegmentWidth),
				currentStyle,
				options,
			);
		}

		currentStyle = style;
		currentSegmentWidth = 1;
	}

	if (currentSegmentWidth > 0) {
		patternTail += paintAnsi(
			" ".repeat(currentSegmentWidth),
			currentStyle,
			options,
		);
	}

	return patternTail;
}

function getPatternIntensity(
	width: number,
	rowIndex: number,
	columnIndex: number,
) {
	const normalizedColumn =
		width <= 1 ? 0 : columnIndex / Math.max(1, width - 1);
	const envelope = 0.18 + 0.82 * Math.pow(normalizedColumn, 0.82);
	const wave =
		Math.sin((columnIndex + rowIndex * 1.9) / 2.9) * 0.22 +
		Math.cos((columnIndex - rowIndex * 2.7) / 6.3) * 0.18 +
		Math.sin((columnIndex + rowIndex * 3.4) / 10.5) * 0.12;
	const blockOffset =
		((Math.floor(columnIndex / 2) + rowIndex) % 2 === 0 ? 0.06 : -0.04) +
		(rowIndex === 0 ? -0.06 : 0);

	return Math.min(1, Math.max(0, envelope + wave + blockOffset));
}

function getPatternCellStyle(intensity: number) {
	const colorIndex = Math.min(
		patternColors.length - 1,
		Math.floor(intensity * patternColors.length),
	);
	const color = patternColors[colorIndex]!;

	return `48;2;${color.red};${color.green};${color.blue}`;
}

export function renderStartupBanner(options: CliRenderOptions) {
	const wordmarkWidth = Math.max(
		...shipBySundayLogoLines.map((line) => line.length),
	);
	const sectionWidth = Math.max(wordmarkWidth, options.terminalWidth ?? 0);
	const patternWidth = Math.max(0, sectionWidth - wordmarkWidth);
	const logoSection = shipBySundayLogoLines.map((line, rowIndex) => {
		const paddedWordmark = line.padEnd(wordmarkWidth, " ");
		return `${paintAnsi(paddedWordmark, wordmarkStyle, options)}${buildPatternTail(patternWidth, rowIndex, options)}`;
	});

	const subtitle = [
		paint("Ship by Sunday CLI", "focus", options),
		paint(
			"local packet intake and starter snapshot generation",
			"muted",
			options,
		),
	].join(` ${paint("•", "frame", options)} `);

	return `${logoSection.join("\n")}\n${subtitle}`;
}
