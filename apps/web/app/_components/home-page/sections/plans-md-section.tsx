import type { HomePageContent } from "@/app/_content/home-page";

type PlansMdSection = HomePageContent["plansMdSection"];
type PlansMdLoop = PlansMdSection["loop"];

const documentLineRows = [
	{ y: 149, shortY: 181 },
	{ y: 211, shortY: 243 },
	{ y: 273, shortY: 305 },
] as const;
const calloutLabelBaselines = [75, 171, 348] as const;
const plansMdLoopAssetPaths = {
	cyclePaths: "/landing-page/plans-md-loop-cycle-paths.svg",
	ideaBubble: "/landing-page/plans-md-loop-idea-bubble.svg",
	ideaPath: "/landing-page/plans-md-loop-idea-path.svg",
} as const;

export function PlansMdSectionBlock({
	plansMdSection,
}: {
	readonly plansMdSection: PlansMdSection;
}) {
	return (
		<section
			aria-labelledby="plans-md-section-title"
			className="relative left-1/2 w-screen max-w-[1440px] -translate-x-1/2 overflow-hidden bg-[#f7f5ef] text-[#111111] dark:bg-[#111111] dark:text-white"
		>
			<h2 id="plans-md-section-title" className="sr-only">
				{plansMdSection.title}, {plansMdSection.subtitleLead}{" "}
				{plansMdSection.subtitleEmphasis} {plansMdSection.subtitleTail}
			</h2>
			<MobilePlansMdSection plansMdSection={plansMdSection} />
			<div className="hidden lg:block">
				<DesktopPlansMdArtwork plansMdSection={plansMdSection} />
			</div>
		</section>
	);
}

function MobilePlansMdSection({
	plansMdSection,
}: {
	readonly plansMdSection: PlansMdSection;
}) {
	return (
		<div className="space-y-12 px-6 py-16 sm:px-10 lg:hidden">
			<div className="space-y-7">
				<div className="leading-none">
					<p className="font-heading-serif text-[4.75rem] tracking-normal italic">
						{plansMdSection.title}
					</p>
					<p className="font-heading-serif text-[2rem] tracking-normal">
						{plansMdSection.subtitleLead}
					</p>
					<p className="font-home-inter -mt-1 text-[3rem] leading-none font-bold tracking-normal">
						{plansMdSection.subtitleEmphasis}
					</p>
					<p className="font-home-inter text-[1.6rem] leading-none font-normal tracking-normal">
						{plansMdSection.subtitleTail}
					</p>
				</div>
				<MobilePlanDocument callouts={plansMdSection.callouts} />
			</div>

			<p className="font-heading-serif max-w-[12ch] text-[3.1rem] leading-[0.92] tracking-normal">
				{plansMdSection.tagline.lead}
				<span className="italic">{plansMdSection.tagline.emphasis}</span>
				{plansMdSection.tagline.tail}
			</p>

			<div className="border-y border-current/20">
				{plansMdSection.differentiators.map((differentiator) => (
					<div
						key={differentiator.title}
						className="border-t border-current/15 py-4 first:border-t-0"
					>
						<p className="text-sm leading-tight font-bold tracking-normal">
							{differentiator.title}
						</p>
						<p className="mt-1 text-sm leading-snug tracking-normal opacity-80">
							{differentiator.description}
						</p>
					</div>
				))}
			</div>

			<MobileLoopDiagram loop={plansMdSection.loop} />
		</div>
	);
}

function MobilePlanDocument({
	callouts,
}: {
	readonly callouts: readonly string[];
}) {
	return (
		<div className="grid items-center gap-6 sm:grid-cols-[11rem_minmax(0,1fr)]">
			<div className="relative h-[13rem] w-[10.5rem] border border-current/80">
				{documentLineRows.map((row) => (
					<div key={row.y}>
						<div
							className="absolute left-[1.8rem] h-[3px] w-[6.75rem] bg-current opacity-85"
							style={{ top: `${(row.y - 128) / 16}rem` }}
						/>
						<div
							className="absolute left-[1.8rem] h-[3px] w-[6.75rem] bg-current opacity-85"
							style={{ top: `${(row.y - 112) / 16}rem` }}
						/>
						<div
							className="absolute left-[5rem] h-[3px] w-[3.6rem] bg-current opacity-85"
							style={{ top: `${(row.shortY - 128) / 16}rem` }}
						/>
					</div>
				))}
			</div>
			<ul className="space-y-4 text-sm tracking-normal opacity-85">
				{callouts.map((callout) => (
					<li key={callout} className="border-t border-current/20 pt-3">
						{callout}
					</li>
				))}
			</ul>
		</div>
	);
}

function MobileLoopDiagram({ loop }: { readonly loop: PlansMdLoop }) {
	return (
		<div className="mx-auto w-full max-w-[24rem]">
			<svg
				viewBox="690 720 560 340"
				className="block h-auto w-full overflow-visible text-current"
				aria-hidden="true"
			>
				<LoopDiagramArtwork loop={loop} maskIdPrefix="plans-md-loop-mobile" />
			</svg>
		</div>
	);
}

function DesktopPlansMdArtwork({
	plansMdSection,
}: {
	readonly plansMdSection: PlansMdSection;
}) {
	return (
		<svg
			viewBox="0 0 1440 1460"
			className="block h-auto w-full text-current"
			aria-hidden="true"
		>
			<DesktopTitleLockup plansMdSection={plansMdSection} />
			<DesktopPlanDocument />
			<DesktopCallouts callouts={plansMdSection.callouts} />
			<DesktopTagline plansMdSection={plansMdSection} />
			<DesktopDifferentiators
				differentiators={plansMdSection.differentiators}
			/>
			<LoopDiagramArtwork
				loop={plansMdSection.loop}
				maskIdPrefix="plans-md-loop-desktop"
			/>
		</svg>
	);
}

function DesktopTitleLockup({
	plansMdSection,
}: {
	readonly plansMdSection: PlansMdSection;
}) {
	return (
		<foreignObject x="276" y="127" width="480" height="220">
			<div className="relative h-full text-current">
				<p className="font-heading-serif absolute top-0 left-0 text-[102px] leading-none tracking-normal italic">
					{plansMdSection.title}
				</p>
				<p className="font-heading-serif absolute top-[95px] left-0 text-[42px] leading-none tracking-normal">
					{plansMdSection.subtitleLead}
				</p>
				<p className="font-home-inter absolute top-[88px] left-[129px] text-[80px] leading-none font-bold tracking-normal">
					{plansMdSection.subtitleEmphasis}
				</p>
				<p className="font-home-inter absolute top-[170px] left-[258px] text-[32px] leading-none font-normal tracking-normal">
					{plansMdSection.subtitleTail}
				</p>
			</div>
		</foreignObject>
	);
}

function DesktopPlanDocument() {
	return (
		<g>
			<rect
				x="772"
				y="128"
				width="166"
				height="208"
				fill="none"
				stroke="currentColor"
				strokeOpacity="0.75"
				strokeWidth="1"
			/>
			{documentLineRows.map((row) => (
				<g key={row.y} fill="currentColor" opacity="0.7">
					<rect x="801" y={row.y} width="108" height="3" />
					<rect x="801" y={row.y + 16} width="108" height="3" />
					<rect x="852" y={row.shortY} width="57" height="3" />
				</g>
			))}
		</g>
	);
}

function DesktopCallouts({
	callouts,
}: {
	readonly callouts: readonly string[];
}) {
	return (
		<g>
			<line
				x1="964"
				y1="127"
				x2="1056"
				y2="79"
				stroke="currentColor"
				strokeWidth="1"
			/>
			<line
				x1="964"
				y1="194"
				x2="1056"
				y2="159"
				stroke="currentColor"
				strokeWidth="1"
			/>
			<line
				x1="955"
				y1="312"
				x2="1044"
				y2="336"
				stroke="currentColor"
				strokeWidth="1"
			/>
			{callouts.map((callout, index) => (
				<text
					key={callout}
					x="1060"
					y={calloutLabelBaselines[index] ?? calloutLabelBaselines[0]}
					fill="currentColor"
					fontFamily="var(--font-inter), ui-sans-serif, system-ui, sans-serif"
					fontSize="12"
					letterSpacing="0"
				>
					{callout}
				</text>
			))}
		</g>
	);
}

function DesktopTagline({
	plansMdSection,
}: {
	readonly plansMdSection: PlansMdSection;
}) {
	return (
		<foreignObject x="276" y="622" width="739" height="110">
			<p className="font-heading-serif m-0 text-[48px] leading-[42px] tracking-normal text-current">
				{plansMdSection.tagline.lead}
				<span className="italic">{plansMdSection.tagline.emphasis}</span>
				{plansMdSection.tagline.tail}
			</p>
		</foreignObject>
	);
}

function DesktopDifferentiators({
	differentiators,
}: {
	readonly differentiators: PlansMdSection["differentiators"];
}) {
	return (
		<foreignObject x="276" y="775" width="324" height="590">
			<div className="space-y-[10px] text-[12px] leading-[1.16] tracking-normal text-current">
				{differentiators.map((differentiator) => (
					<div key={differentiator.title}>
						<p className="m-0 font-bold">{differentiator.title}</p>
						<p className="m-0 font-normal">{differentiator.description}</p>
					</div>
				))}
			</div>
		</foreignObject>
	);
}

function LoopDiagramArtwork({
	loop,
	maskIdPrefix,
}: {
	readonly loop: PlansMdLoop;
	readonly maskIdPrefix: string;
}) {
	const maskIds = {
		cyclePaths: `${maskIdPrefix}-cycle-paths-mask`,
		ideaBubble: `${maskIdPrefix}-idea-bubble-mask`,
		ideaPath: `${maskIdPrefix}-idea-path-mask`,
	} as const;

	return (
		<g>
			<defs>
				<mask
					id={maskIds.cyclePaths}
					maskUnits="userSpaceOnUse"
					x="844"
					y="731.5"
					width="375.999"
					height="315.847"
				>
					<image
						href={plansMdLoopAssetPaths.cyclePaths}
						x="844"
						y="731.5"
						width="375.999"
						height="315.847"
						preserveAspectRatio="none"
					/>
				</mask>
				<mask
					id={maskIds.ideaBubble}
					maskUnits="userSpaceOnUse"
					x="739.65"
					y="849.54"
					width="74.583"
					height="54.463"
				>
					<image
						href={plansMdLoopAssetPaths.ideaBubble}
						x="739.65"
						y="849.54"
						width="74.583"
						height="54.463"
						preserveAspectRatio="none"
					/>
				</mask>
				<mask
					id={maskIds.ideaPath}
					maskUnits="userSpaceOnUse"
					x="790.5"
					y="781"
					width="400.873"
					height="257.161"
				>
					<image
						href={plansMdLoopAssetPaths.ideaPath}
						x="790.5"
						y="781"
						width="400.873"
						height="257.161"
						preserveAspectRatio="none"
					/>
				</mask>
			</defs>
			<circle
				cx="740"
				cy="915"
				r="8.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
			/>
			<line
				x1="739"
				y1="923"
				x2="739"
				y2="972"
				stroke="currentColor"
				strokeWidth="1"
			/>
			<line
				x1="739"
				y1="972"
				x2="731"
				y2="1006"
				stroke="currentColor"
				strokeWidth="1"
			/>
			<line
				x1="739"
				y1="972"
				x2="748"
				y2="1006"
				stroke="currentColor"
				strokeWidth="1"
			/>
			<line
				x1="720"
				y1="937"
				x2="754.64"
				y2="943.1"
				stroke="currentColor"
				strokeWidth="1"
			/>
			<foreignObject x="757" y="861" width="70" height="32">
				<div className="font-home-inter text-[22px] leading-normal font-normal tracking-[-1.1px] text-current">
					{loop.ideaLabel}
				</div>
			</foreignObject>
			<rect
				x="739.65"
				y="849.54"
				width="74.583"
				height="54.463"
				fill="currentColor"
				mask={`url(#${maskIds.ideaBubble})`}
			/>
			<path
				d="M790.5 781H1191.37V1038.16H790.5V781Z"
				fill="currentColor"
				mask={`url(#${maskIds.ideaPath})`}
			/>
			<LoopLabelSvg x={1041} y={768} label={loop.shipLabel} />
			<LoopLabelSvg x={897} y={893} label={loop.writeLabel} />
			<LoopLabelSvg x={1026} y={1025} label={loop.grillLabel} />
			<LoopLabelSvg x={1162} y={896} label={loop.executeLabel} />
			<rect
				x="844"
				y="731.5"
				width="375.999"
				height="315.847"
				fill="currentColor"
				mask={`url(#${maskIds.cyclePaths})`}
			/>
		</g>
	);
}

function LoopLabelSvg({
	x,
	y,
	label,
}: {
	readonly x: number;
	readonly y: number;
	readonly label: string;
}) {
	return (
		<foreignObject x={x} y={y} width="92" height="28">
			<div className="font-home-inter inline-flex h-[26px] items-center justify-center bg-[#111111] p-[2px] text-[22px] leading-none font-normal tracking-[-1.1px] text-[#f7f5ef] dark:bg-white dark:text-[#383030]">
				{label}
			</div>
		</foreignObject>
	);
}
