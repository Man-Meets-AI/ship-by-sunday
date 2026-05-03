import type { CSSProperties } from "react";

import type { HomePageContent } from "@/app/_content/home-page";

type ProgramsSection = HomePageContent["programsSection"];

const zeroLetterSpacing = { letterSpacing: 0 } satisfies CSSProperties;

const desktopPipelinePlacements = [
	"left-[749px] top-[709px]",
	"left-[916px] top-[790px]",
	"left-[749px] top-[878px]",
	"left-[909px] top-[964px]",
	"left-[822px] top-[1084px]",
	"left-[902px] top-[1177px]",
	"left-[747px] top-[1265px]",
	"left-[874px] top-[1381px]",
] as const;

export function ProgramsSectionBlock({
	programsSection,
}: {
	readonly programsSection: ProgramsSection;
}) {
	return (
		<section
			className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#f7f5ef] text-[#111111] dark:bg-[#111111] dark:text-white"
			data-testid="programs-section"
			style={zeroLetterSpacing}
		>
			<ProgramsDesktopFrame programsSection={programsSection} />
			<ProgramsMobileLayout programsSection={programsSection} />
		</section>
	);
}

function ProgramsDesktopFrame({
	programsSection,
}: {
	readonly programsSection: ProgramsSection;
}) {
	return (
		<div className="relative mx-auto hidden h-[1836px] w-[1440px] max-w-none xl:block">
			<div className="absolute top-[89px] left-[283px] whitespace-nowrap">
				<p
					className="font-heading-serif text-[102px] leading-[0.95] font-normal italic"
					style={zeroLetterSpacing}
				>
					{programsSection.title}
				</p>
				<p
					className="font-heading-serif mt-[-8px] text-[42px] leading-none font-normal"
					style={zeroLetterSpacing}
				>
					{programsSection.subtitle}
				</p>
			</div>

			<ProgramArchiveDiagram />
			<StickFigureCallout label={programsSection.speechBubble} />

			<div className="absolute top-[608px] left-[283px] w-[664px]">
				<h2
					className="font-heading-serif text-[48px] leading-none font-normal"
					style={zeroLetterSpacing}
				>
					{programsSection.headline}
				</h2>
				<p className="mt-1 text-[12px] leading-none text-current">
					{programsSection.body}
				</p>
			</div>

			<ProgramExplainerList
				className="absolute top-[697px] left-[285px] w-[271px]"
				explainers={programsSection.explainers}
			/>
			<PipelineConnectorSvg />
			<ProgramsPipelineLabels programsSection={programsSection} />
			<ExecPlanLoopLabels loopSteps={programsSection.loopSteps} />
			<PipelineLabel className="left-[801px] top-[1721px]">
				{programsSection.outcome}
			</PipelineLabel>
		</div>
	);
}

function ProgramArchiveDiagram() {
	return (
		<div
			aria-hidden="true"
			className="absolute top-[152px] left-[925px] h-[301px] w-[252px] border-4 border-current"
		>
			<div className="absolute top-[9px] left-[7px] h-[276px] w-[231px] border border-current" />
			<div className="absolute top-[17px] left-[18px] grid grid-cols-4 gap-x-[8px] gap-y-[8px]">
				{Array.from({ length: 16 }, (_, documentIndex) => (
					<div
						key={`program-document-${documentIndex}`}
						className="h-[58px] w-[46px] border border-current"
					>
						<div className="mt-[8px] ml-[8px] h-[2px] w-[30px] bg-current opacity-70" />
						<div className="mt-[4px] ml-[8px] h-[2px] w-[30px] bg-current opacity-70" />
						<div className="mt-[5px] ml-[22px] h-[2px] w-[16px] bg-current opacity-70" />
					</div>
				))}
			</div>
		</div>
	);
}

function StickFigureCallout({ label }: { readonly label: string }) {
	return (
		<div aria-hidden="true">
			<div className="absolute top-[305px] left-[424px] h-[80px] w-[473px]">
				<div className="absolute top-[18px] left-[12px] h-[32px] w-[452px] rounded-full border border-current opacity-35" />
				<div className="absolute top-[49px] left-[48px] h-[28px] w-px rotate-[-25deg] bg-current opacity-35" />
				<p className="absolute top-[18px] left-[31px] text-[22px] leading-[27px] whitespace-nowrap text-current">
					{label}
				</p>
			</div>
			<div className="absolute top-[390px] left-[473px] h-[18px] w-[18px] rounded-full border border-current opacity-75" />
			<div className="absolute top-[407px] left-[481px] h-[49px] w-px bg-current opacity-65" />
			<div className="absolute top-[425px] left-[462px] h-px w-[35px] rotate-[10deg] bg-current opacity-65" />
			<div className="absolute top-[456px] left-[472px] h-[35px] w-px rotate-[13deg] bg-current opacity-65" />
			<div className="absolute top-[456px] left-[489px] h-[35px] w-px rotate-[-15deg] bg-current opacity-65" />
		</div>
	);
}

function ProgramExplainerList({
	className,
	explainers,
}: {
	readonly className?: string;
	readonly explainers: ProgramsSection["explainers"];
}) {
	return (
		<div className={className}>
			{explainers.map((explainer) => (
				<div key={explainer.title} className="mb-[13px] last:mb-0">
					<h3 className="text-[12px] leading-none font-bold text-current">
						{explainer.title}
					</h3>
					<p className="mt-[2px] text-[12px] leading-none text-current">
						{explainer.description}
					</p>
				</div>
			))}
		</div>
	);
}

function PipelineConnectorSvg() {
	return (
		<svg
			aria-hidden="true"
			className="absolute inset-0 h-full w-full text-current"
			fill="none"
			viewBox="0 0 1440 1836"
		>
			<defs>
				<marker
					id="programs-arrow"
					markerHeight="8"
					markerWidth="8"
					orient="auto"
					refX="7"
					refY="4"
					viewBox="0 0 8 8"
				>
					<path d="M0 0 L8 4 L0 8" fill="currentColor" />
				</marker>
			</defs>
			<g
				markerEnd="url(#programs-arrow)"
				opacity="0.45"
				stroke="currentColor"
				strokeLinecap="round"
				strokeWidth="1"
			>
				<path d="M856 735 L910 786" />
				<path d="M976 816 L895 873" />
				<path d="M822 904 L902 959" />
				<path d="M1040 990 L1006 1080" />
				<path d="M914 1110 L990 1172" />
				<path d="M1040 1203 L879 1260" />
				<path d="M813 1291 L874 1376" />
				<path d="M942 1407 L970 1468" />
				<path d="M973 1506 C960 1572 1008 1624 1070 1618" />
				<path d="M1118 1620 C1200 1624 1260 1565 1252 1506" />
				<path d="M1206 1486 C1140 1448 1055 1448 1002 1484" />
				<path d="M1075 1640 L943 1716" />
			</g>
		</svg>
	);
}

function ProgramsPipelineLabels({
	programsSection,
}: {
	readonly programsSection: ProgramsSection;
}) {
	return (
		<>
			{desktopPipelinePlacements.map((placement, index) => (
				<PipelineLabel
					key={programsSection.pipeline[index]}
					className={placement}
				>
					{programsSection.pipeline[index]}
				</PipelineLabel>
			))}
		</>
	);
}

function ExecPlanLoopLabels({
	loopSteps,
}: {
	readonly loopSteps: ProgramsSection["loopSteps"];
}) {
	return (
		<>
			<PipelineLabel className="left-[947px] top-[1474px]">
				{loopSteps[0]}
			</PipelineLabel>
			<PipelineLabel className="left-[1076px] top-[1606px]">
				{loopSteps[1]}
			</PipelineLabel>
			<PipelineLabel className="left-[1212px] top-[1477px]">
				{loopSteps[2]}
			</PipelineLabel>
		</>
	);
}

function PipelineLabel({
	children,
	className,
}: {
	readonly children: string | undefined;
	readonly className: string;
}) {
	if (!children) {
		return null;
	}

	return (
		<div
			className={`absolute h-[26px] bg-[#111111] px-[2px] text-white dark:bg-white dark:text-[#383030] ${className}`}
		>
			<p className="text-[22px] leading-[27px] whitespace-nowrap text-current">
				{children}
			</p>
		</div>
	);
}

function ProgramsMobileLayout({
	programsSection,
}: {
	readonly programsSection: ProgramsSection;
}) {
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-14 px-6 py-20 sm:px-12 xl:hidden">
			<div className="space-y-8">
				<div>
					<p
						className="font-heading-serif text-[3.5rem] leading-[0.9] font-normal italic sm:text-[5.5rem]"
						style={zeroLetterSpacing}
					>
						{programsSection.title}
					</p>
					<p
						className="font-heading-serif mt-1 text-[2rem] leading-none font-normal sm:text-[2.625rem]"
						style={zeroLetterSpacing}
					>
						{programsSection.subtitle}
					</p>
				</div>
				<div className="flex items-start justify-between gap-8">
					<div className="max-w-[20rem] rounded-full border border-current px-4 py-2 text-sm text-current opacity-80 sm:text-base">
						{programsSection.speechBubble}
					</div>
					<CompactProgramArchiveDiagram />
				</div>
			</div>

			<div className="grid gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
				<div>
					<h2
						className="font-heading-serif text-[2.75rem] leading-none font-normal sm:text-[3.5rem]"
						style={zeroLetterSpacing}
					>
						{programsSection.headline}
					</h2>
					<p className="mt-2 text-sm leading-snug text-current">
						{programsSection.body}
					</p>
					<ProgramExplainerList
						className="mt-8"
						explainers={programsSection.explainers}
					/>
				</div>
				<MobileProgramPipeline programsSection={programsSection} />
			</div>
		</div>
	);
}

function CompactProgramArchiveDiagram() {
	return (
		<div
			aria-hidden="true"
			className="relative hidden h-[132px] w-[110px] shrink-0 border-2 border-current sm:block"
		>
			<div className="absolute top-[5px] left-[4px] h-[120px] w-[99px] border border-current" />
			<div className="absolute top-[10px] left-[9px] grid grid-cols-4 gap-x-[4px] gap-y-[4px]">
				{Array.from({ length: 16 }, (_, documentIndex) => (
					<div
						key={`compact-program-document-${documentIndex}`}
						className="h-[25px] w-[20px] border border-current"
					>
						<div className="mt-[4px] ml-[3px] h-px w-[13px] bg-current opacity-70" />
						<div className="mt-[3px] ml-[3px] h-px w-[13px] bg-current opacity-70" />
						<div className="mt-[3px] ml-[8px] h-px w-[8px] bg-current opacity-70" />
					</div>
				))}
			</div>
		</div>
	);
}

function MobileProgramPipeline({
	programsSection,
}: {
	readonly programsSection: ProgramsSection;
}) {
	const pipelineSteps = [
		...programsSection.pipeline.map((label) => ({ kind: "step", label })),
		{ kind: "outcome", label: programsSection.outcome },
	] as const;

	return (
		<ol className="relative text-current">
			{pipelineSteps.map((pipelineStep, index) => (
				<li key={pipelineStep.label} className="relative">
					<span className="inline-flex bg-[#111111] px-1 py-0.5 text-base leading-none text-white dark:bg-white dark:text-[#383030]">
						{pipelineStep.label}
					</span>
					{pipelineStep.label === "execplan loop" ? (
						<div className="mt-4 flex flex-wrap gap-2">
							{programsSection.loopSteps.map((loopStep, loopStepIndex) => (
								<div
									key={loopStep}
									className="flex items-center gap-2 text-current"
								>
									<span className="rounded-full border border-current px-3 py-1 text-sm text-current opacity-80">
										{loopStep}
									</span>
									{loopStepIndex < programsSection.loopSteps.length - 1 ? (
										<MobileLoopStepArrow />
									) : null}
								</div>
							))}
						</div>
					) : null}
					{index < pipelineSteps.length - 1 ? (
						<MobilePipelineArrow
							className={
								pipelineStep.label === "execplan loop" ? "h-12" : "h-7"
							}
						/>
					) : null}
				</li>
			))}
		</ol>
	);
}

function MobileLoopStepArrow() {
	return (
		<svg
			aria-hidden="true"
			className="h-3 w-5 opacity-45"
			fill="none"
			viewBox="0 0 20 12"
		>
			<path
				d="M1 6 H17 M13 2 L17 6 L13 10"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
		</svg>
	);
}

function MobilePipelineArrow({ className }: { readonly className: string }) {
	return (
		<svg
			aria-hidden="true"
			className={`ml-4 w-5 text-current opacity-45 ${className}`}
			fill="none"
			viewBox="0 0 20 48"
		>
			<path
				d="M10 2 V40 M5 35 L10 40 L15 35"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
		</svg>
	);
}
