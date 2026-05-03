"use client";

import Image from "next/image";

import type { HomePageContent } from "@/app/_content/home-page";

type CodebaseBranchContent =
	HomePageContent["productPreviewSection"]["codebaseBranch"];

export function BlueprintDemoCodebaseBranch({
	codebaseBranch,
}: {
	readonly codebaseBranch: CodebaseBranchContent;
}) {
	return (
		<section
			data-testid="blueprint-demo-codebase-branch"
			className="relative left-1/2 w-screen -translate-x-1/2 bg-[#111111] px-6 pt-10 pb-24 text-[#ececec] sm:px-12 sm:pt-14 lg:pt-20 lg:pb-36"
		>
			<div className="mx-auto flex w-full max-w-[53.0625rem] flex-col items-center">
				<article className="w-full rounded-lg border border-[#353535] bg-[#202020] p-4 sm:p-5 lg:p-2.5">
					<div className="font-heading-serif text-[clamp(2.125rem,6.2vw,3.875rem)] leading-[1.02] font-normal tracking-[-0.04em] text-[#ececec]">
						<p>{renderInlineShippie(codebaseBranch.intro, codebaseBranch)}</p>
						<div className="my-7 space-y-0 sm:my-9">
							<p>
								<span>{codebaseBranch.auditLead}</span>{" "}
								<a
									href={codebaseBranch.auditHref}
									className="underline decoration-[#ececec] underline-offset-[0.12em] transition-colors hover:text-white"
								>
									{codebaseBranch.auditLinkLabel}
								</a>{" "}
								<span>
									{renderInlineShippie(
										codebaseBranch.auditBody,
										codebaseBranch,
									)}
								</span>
							</p>
						</div>
						<div className="my-7 space-y-0 sm:my-9">
							<p>{codebaseBranch.todoIntro}</p>
							<p>{codebaseBranch.todoSetupLine}</p>
							<ol className="ml-[1.15em] list-decimal">
								{codebaseBranch.todos.map((todo) => (
									<li key={todo}>
										{renderInlineShippie(todo, codebaseBranch)}
									</li>
								))}
							</ol>
						</div>
						<p className="my-7 sm:my-9">{codebaseBranch.privacyQuestion}</p>
						<p>{codebaseBranch.privacyAnswer}</p>
					</div>
				</article>
				<div className="font-heading-serif mt-16 w-full max-w-[29.125rem] text-[#ececec] sm:mt-20">
					<h2 className="text-[clamp(2.5rem,6vw,3.875rem)] leading-none font-normal tracking-[-0.04em]">
						{codebaseBranch.auditList.title}
					</h2>
					<ul className="mt-1 space-y-0 text-[clamp(2rem,5vw,3.25rem)] leading-[1.02] tracking-[-0.04em]">
						{codebaseBranch.auditList.items.map((item) => (
							<li key={item}>→ {item}</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}

function renderInlineShippie(
	text: string,
	codebaseBranch: CodebaseBranchContent,
) {
	const textSegments = text.split(codebaseBranch.shippieName);
	if (textSegments.length === 1) {
		return text;
	}

	return (
		<>
			{textSegments.map((segment, index) => {
				const isLastSegment = index === textSegments.length - 1;
				return (
					<span key={`${segment}-${index}`}>
						{segment}
						{isLastSegment ? null : (
							<>
								{codebaseBranch.shippieName}
								<ShippieInlineImage codebaseBranch={codebaseBranch} />
							</>
						)}
					</span>
				);
			})}
		</>
	);
}

function ShippieInlineImage({
	codebaseBranch,
}: {
	readonly codebaseBranch: CodebaseBranchContent;
}) {
	return (
		<Image
			alt=""
			aria-hidden="true"
			className="mx-[0.12em] inline-block size-[1em] translate-y-[0.12em]"
			height={1254}
			src={codebaseBranch.shippieImage.src}
			width={1254}
		/>
	);
}
