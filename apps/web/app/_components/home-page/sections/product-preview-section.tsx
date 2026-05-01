"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
	ArrowRight,
	CheckCircle2,
	CirclePlay,
	Code2,
	GitBranch,
	LockKeyhole,
	ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";
import { routeConfig } from "@/config/product";
import type { HomePageContent } from "@/app/_content/home-page";

import { ProductPreviewLoopPacketBlock } from "./product-preview-loop-packet";
import { ScrollReveal } from "./scroll-reveal";

type ProductPreviewSection = HomePageContent["productPreviewSection"];
type ProductPreviewTab = ProductPreviewSection["workspace"]["tabs"][number];

const defaultCheckedChecklistItems = ["truth", "roles"] as const;

function ProductPreviewTopBar() {
	return (
		<div className="flex items-center justify-between gap-4 py-2">
			<ProductBrand
				href={routeConfig.home}
				labelClassName={productWordmarkClassName}
			/>
			<nav className="flex items-center gap-3 text-sm" aria-label="Home">
				<Link
					href={routeConfig.docs}
					className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline"
				>
					Docs
				</Link>
				<Link
					href={routeConfig.signIn}
					className="text-muted-foreground transition-colors hover:text-foreground"
				>
					Sign in
				</Link>
				<Button asChild size="sm" className="hidden sm:inline-flex">
					<Link href={routeConfig.pricingHash}>Unlock</Link>
				</Button>
			</nav>
		</div>
	);
}

function ProductPreviewActions({
	section,
}: {
	readonly section: ProductPreviewSection;
}) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row">
			<Button asChild size="lg" className="h-11 px-5">
				<Link
					href={section.primaryAction.href}
					data-testid="preview-primary-cta"
				>
					{section.primaryAction.label}
					<ArrowRight data-icon="inline-end" />
				</Link>
			</Button>
			<Button asChild size="lg" variant="outline" className="h-11 px-5">
				<Link
					href={section.secondaryAction.href}
					data-testid="preview-secondary-cta"
				>
					<CirclePlay data-icon="inline-start" />
					{section.secondaryAction.label}
				</Link>
			</Button>
		</div>
	);
}

function ProductPreviewChecklist({
	section,
	checkedItemIds,
	onToggleItem,
}: {
	readonly section: ProductPreviewSection;
	readonly checkedItemIds: readonly string[];
	readonly onToggleItem: (itemId: string) => void;
}) {
	return (
		<div className="grid gap-2 sm:grid-cols-2">
			{section.workspace.checklist.map((item) => (
				<label
					key={item.id}
					className="flex min-h-12 items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
				>
					<Checkbox
						checked={checkedItemIds.includes(item.id)}
						onCheckedChange={() => onToggleItem(item.id)}
						aria-label={item.label}
					/>
					<span>{item.label}</span>
				</label>
			))}
		</div>
	);
}

function ProductPreviewTabPanel({ tab }: { readonly tab: ProductPreviewTab }) {
	return (
		<div className="grid gap-3 sm:grid-cols-3">
			{tab.items.map((item, index) => (
				<div
					key={item.label}
					className="rounded-lg border border-border/60 bg-muted/35 p-3"
				>
					<p className="text-xs text-muted-foreground">
						{String(index + 1).padStart(2, "0")}
					</p>
					<p className="mt-1 text-sm font-medium text-foreground">
						{item.label}
					</p>
					<p className="mt-2 text-xs leading-5 text-muted-foreground">
						{item.detail}
					</p>
				</div>
			))}
		</div>
	);
}

function ProductPreviewWorkbench({
	section,
}: {
	readonly section: ProductPreviewSection;
}) {
	const firstTab = section.workspace.tabs[0]?.id ?? "source";
	const [githubUsername, setGithubUsername] = useState<string>(
		section.workspace.githubUsernamePlaceholder,
	);
	const [activeTabId, setActiveTabId] = useState<string>(firstTab);
	const [checkedItemIds, setCheckedItemIds] = useState<readonly string[]>(
		defaultCheckedChecklistItems,
	);
	const activeTab = useMemo(
		() =>
			section.workspace.tabs.find((tab) => tab.id === activeTabId) ??
			section.workspace.tabs[0],
		[activeTabId, section.workspace.tabs],
	);

	function toggleChecklistItem(itemId: string) {
		setCheckedItemIds((currentItemIds) =>
			currentItemIds.includes(itemId)
				? currentItemIds.filter((currentItemId) => currentItemId !== itemId)
				: [...currentItemIds, itemId],
		);
	}

	return (
		<div
			className="overflow-hidden rounded-xl border border-border/70 bg-background shadow-2xl shadow-foreground/5"
			aria-label="Public preview of the worker layer workspace"
			data-testid="product-preview-workbench"
		>
			<div className="flex items-center justify-between gap-4 border-b border-border/60 px-4 py-3">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<Code2 className="size-4" aria-hidden />
					</div>
					<div>
						<p className="text-sm font-semibold">{section.workspace.title}</p>
						<p className="text-xs text-muted-foreground">Protected workspace</p>
					</div>
				</div>
				<Badge variant="outline">{section.workspace.statusLabel}</Badge>
			</div>

			<div className="grid gap-0 lg:grid-cols-[13rem_minmax(0,1fr)]">
				<aside className="border-b border-border/60 bg-muted/25 p-4 lg:border-r lg:border-b-0">
					<div className="space-y-2">
						{["Product", "Design", "Marketing", "Build Plan", "Review"].map(
							(item, index) => (
								<div
									key={item}
									className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm"
								>
									<span className="flex size-5 items-center justify-center rounded-full border text-[0.65rem] text-muted-foreground">
										{index + 1}
									</span>
									<span
										className={
											index < 3 ? "text-foreground" : "text-muted-foreground"
										}
									>
										{item}
									</span>
								</div>
							),
						)}
					</div>
				</aside>

				<div className="space-y-5 p-4 sm:p-5">
					<div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
						<label className="space-y-2">
							<span className="text-sm font-medium">
								{section.workspace.githubUsernameLabel}
							</span>
							<Input
								value={githubUsername}
								onChange={(event) => setGithubUsername(event.target.value)}
								placeholder={section.workspace.githubUsernamePlaceholder}
								autoCapitalize="none"
								autoCorrect="off"
								spellCheck={false}
								aria-describedby="product-preview-github-help"
							/>
						</label>
						<div className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm">
							<GitBranch className="size-4 text-muted-foreground" aria-hidden />
							<span className="font-medium">
								@{githubUsername || "parkerrex"}
							</span>
						</div>
					</div>
					<p
						id="product-preview-github-help"
						className="text-sm leading-6 text-muted-foreground"
					>
						{section.workspace.githubUsernameHelp}
					</p>

					<ProductPreviewLoopPacketBlock loopPacket={section.loopPacket} />

					<ProductPreviewChecklist
						section={section}
						checkedItemIds={checkedItemIds}
						onToggleItem={toggleChecklistItem}
					/>

					<Tabs value={activeTabId} onValueChange={setActiveTabId}>
						<TabsList className="w-full justify-start overflow-x-auto">
							{section.workspace.tabs.map((tab) => (
								<TabsTrigger key={tab.id} value={tab.id} className="px-3">
									{tab.label}
								</TabsTrigger>
							))}
						</TabsList>
						{activeTab ? (
							<TabsContent value={activeTab.id} className="space-y-3 pt-2">
								<div className="flex items-start justify-between gap-3">
									<div>
										<h2 className="text-xl font-semibold">{activeTab.title}</h2>
										<p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground">
											{activeTab.description}
										</p>
									</div>
									<CheckCircle2
										className="mt-1 size-5 text-foreground"
										aria-hidden
									/>
								</div>
								<ProductPreviewTabPanel tab={activeTab} />
							</TabsContent>
						) : null}
					</Tabs>
				</div>
			</div>
		</div>
	);
}

export function ProductPreviewSectionBlock({
	section,
}: {
	readonly section: ProductPreviewSection;
}) {
	return (
		<section className="flex min-h-screen flex-col gap-10 pb-20 pt-2 sm:gap-14 sm:pb-24">
			<ProductPreviewTopBar />
			<div className="grid flex-1 items-start gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-14">
				<ScrollReveal>
					<div className="max-w-xl space-y-7">
						<p className="text-sm font-semibold text-muted-foreground">
							{section.kicker}
						</p>
						<div className="space-y-5">
							<h1 className="text-balance text-5xl font-semibold leading-[0.92] text-foreground sm:text-7xl lg:text-8xl">
								{section.title}
							</h1>
							<p className="max-w-lg text-pretty text-lg leading-8 text-muted-foreground">
								{section.intro}
							</p>
						</div>
						<ProductPreviewActions section={section} />
						<div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm leading-6 text-muted-foreground">
							<LockKeyhole
								className="mt-1 size-4 shrink-0 text-foreground"
								aria-hidden
							/>
							<p>{section.unlockNote}</p>
						</div>
					</div>
				</ScrollReveal>
				<ScrollReveal delay={0.12}>
					<ProductPreviewWorkbench section={section} />
				</ScrollReveal>
			</div>
			<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
				<ShieldCheck className="size-4" aria-hidden />
				<span>{section.previewNote}</span>
				<ArrowRight className="size-4" aria-hidden />
			</div>
		</section>
	);
}
