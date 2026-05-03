import type { HomePageContent } from "@/app/_content/home-page";

type PlansMdSection = HomePageContent["plansMdSection"];
type PlansMdLoop = PlansMdSection["loop"];

const documentLineRows = [
	{ y: 149, shortY: 181 },
	{ y: 211, shortY: 243 },
	{ y: 273, shortY: 305 },
] as const;
const calloutLabelBaselines = [75, 171, 348] as const;

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
					<p className="font-home-inter -mt-1 text-[2.45rem] leading-none font-normal tracking-normal">
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
		<div className="relative mx-auto aspect-square w-full max-w-[22rem]">
			<svg
				viewBox="0 0 352 352"
				className="size-full overflow-visible"
				aria-hidden="true"
			>
				<defs>
					<marker
						id="plans-mobile-arrow"
						markerHeight="8"
						markerWidth="8"
						orient="auto"
						refX="7"
						refY="4"
					>
						<path d="M0 0 L8 4 L0 8 Z" fill="currentColor" />
					</marker>
					<marker
						id="plans-mobile-arrow-muted"
						markerHeight="8"
						markerWidth="8"
						orient="auto"
						refX="7"
						refY="4"
					>
						<path d="M0 0 L8 4 L0 8 Z" fill="currentColor" fillOpacity="0.28" />
					</marker>
				</defs>
				<path
					d="M64 168 C95 178 113 161 143 146"
					fill="none"
					stroke="currentColor"
					strokeLinecap="round"
					strokeWidth="1.2"
				/>
				<path
					d="M143 146 C153 93 205 68 246 83 C302 102 318 158 292 206 C265 255 194 261 151 222 C131 204 115 178 109 154"
					fill="none"
					markerEnd="url(#plans-mobile-arrow)"
					stroke="currentColor"
					strokeWidth="1.35"
				/>
				<path
					d="M136 56 C174 69 197 69 222 55"
					fill="none"
					markerEnd="url(#plans-mobile-arrow-muted)"
					stroke="currentColor"
					strokeOpacity="0.28"
					strokeWidth="1.2"
				/>
				<path
					d="M226 61 C289 57 334 122 315 194 C290 270 201 292 129 256"
					fill="none"
					markerEnd="url(#plans-mobile-arrow-muted)"
					stroke="currentColor"
					strokeOpacity="0.28"
					strokeWidth="1.2"
				/>
				<circle cx="52" cy="148" fill="none" r="6" stroke="currentColor" />
				<path
					d="M52 154 V183 M40 164 L64 168 M52 183 L45 205 M52 183 L59 205"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				<path
					d="M77 103 C57 103 45 113 45 126 C45 138 56 146 70 145 L67 157 L84 144 C105 142 115 132 115 119 C115 109 100 103 77 103 Z"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
			</svg>
			<p className="absolute top-[31%] left-[18%] text-lg tracking-normal">
				{loop.ideaLabel}
			</p>
			<LoopLabel className="top-[16%] left-[63%]">{loop.shipLabel}</LoopLabel>
			<LoopLabel className="top-[40%] left-[41%]">{loop.writeLabel}</LoopLabel>
			<LoopLabel className="top-[41%] right-[1%]">
				{loop.executeLabel}
			</LoopLabel>
			<LoopLabel className="bottom-[20%] left-[60%]">
				{loop.grillLabel}
			</LoopLabel>
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
			<DesktopLoopDiagram loop={plansMdSection.loop} />
		</svg>
	);
}

function DesktopTitleLockup({
	plansMdSection,
}: {
	readonly plansMdSection: PlansMdSection;
}) {
	return (
		<foreignObject x="276" y="127" width="460" height="210">
			<div className="relative h-full text-current">
				<p className="font-heading-serif absolute top-0 left-0 text-[102px] leading-none tracking-normal italic">
					{plansMdSection.title}
				</p>
				<p className="font-heading-serif absolute top-[95px] left-0 text-[42px] leading-none tracking-normal">
					{plansMdSection.subtitleLead}
				</p>
				<p className="font-home-inter absolute top-[94px] left-[129px] text-[62px] leading-none font-normal tracking-normal">
					{plansMdSection.subtitleEmphasis}
				</p>
				<p className="font-home-inter absolute top-[149px] left-[258px] text-[32px] leading-none font-normal tracking-normal">
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

function DesktopLoopDiagram({ loop }: { readonly loop: PlansMdLoop }) {
	return (
		<g>
			<defs>
				<marker
					id="plans-arrow-white"
					markerHeight="8"
					markerWidth="8"
					orient="auto"
					refX="7"
					refY="4"
				>
					<path d="M0 0 L8 4 L0 8 Z" fill="currentColor" />
				</marker>
				<marker
					id="plans-arrow-muted"
					markerHeight="8"
					markerWidth="8"
					orient="auto"
					refX="7"
					refY="4"
				>
					<path d="M0 0 L8 4 L0 8 Z" fill="currentColor" fillOpacity="0.28" />
				</marker>
			</defs>
			<path
				d="M739 923 V972 M720 939 L754 945 M739 972 L731 1006 M739 972 L748 1006"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
			/>
			<circle cx="740" cy="915" r="9" fill="none" stroke="currentColor" />
			<path
				d="M780 850 C751 850 739 861 739 879 C739 894 755 903 774 902 L770 917 L789 900 C814 897 825 885 825 869 C825 858 810 850 780 850 Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
			/>
			<text
				x="757"
				y="883"
				fill="currentColor"
				fontFamily="var(--font-inter), ui-sans-serif, system-ui, sans-serif"
				fontSize="22"
				letterSpacing="0"
			>
				{loop.ideaLabel}
			</text>
			<path
				d="M754 943 C790 954 811 937 833 923 C854 909 874 906 897 906"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeWidth="1"
			/>
			<path
				d="M897 906 C914 814 1005 775 1075 798 C1162 827 1189 916 1146 988 C1103 1060 999 1065 925 1012 C891 988 866 955 852 924"
				fill="none"
				markerEnd="url(#plans-arrow-white)"
				stroke="currentColor"
				strokeWidth="1"
			/>
			<path
				d="M1047 768 C1155 760 1220 870 1187 1000 C1139 1132 985 1170 862 1109"
				fill="none"
				markerEnd="url(#plans-arrow-muted)"
				stroke="currentColor"
				strokeOpacity="0.28"
				strokeWidth="1"
			/>
			<path
				d="M890 737 C956 759 995 760 1039 736"
				fill="none"
				markerEnd="url(#plans-arrow-muted)"
				stroke="currentColor"
				strokeOpacity="0.28"
				strokeWidth="1"
			/>
			<LoopLabelSvg x={1041} y={768} label={loop.shipLabel} />
			<LoopLabelSvg x={897} y={893} label={loop.writeLabel} />
			<LoopLabelSvg x={1026} y={1025} label={loop.grillLabel} />
			<LoopLabelSvg x={1162} y={896} label={loop.executeLabel} />
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
			<div className="inline-flex h-[26px] items-center justify-center bg-[#111111] px-0.5 py-0 text-[22px] leading-none tracking-normal text-[#f7f5ef] dark:bg-white dark:text-[#383030]">
				{label}
			</div>
		</foreignObject>
	);
}

function LoopLabel({
	children,
	className,
}: {
	children: string;
	className: string;
}) {
	return (
		<span
			className={`absolute bg-[#111111] px-1 py-0.5 text-lg leading-none tracking-normal text-[#f7f5ef] dark:bg-white dark:text-[#383030] ${className}`}
		>
			{children}
		</span>
	);
}
