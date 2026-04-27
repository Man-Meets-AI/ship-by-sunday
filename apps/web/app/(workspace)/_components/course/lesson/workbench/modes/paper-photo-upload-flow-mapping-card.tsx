"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function FlowContextStrip({
	selectedUser,
	userPain,
	outcome,
}: {
	selectedUser: string;
	userPain: string;
	outcome: string;
}) {
	return (
		<div className="grid gap-3 md:grid-cols-2">
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
						User
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 pt-0">
					<p className="text-sm font-medium leading-relaxed text-foreground">
						{selectedUser}
					</p>
					<p className="text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
						Start from the moment this hurts: {userPain}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
						Promise
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 pt-0">
					<p className="text-sm font-medium leading-relaxed text-foreground [text-wrap:pretty]">
						{outcome}
					</p>
					<p className="text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
						Draw only the shortest believable path that gets this user here.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

export function FlowMappingCard({
	selectedUser,
	userPain,
	currentWorkaround,
	outcome,
	successLooksLike,
	showContext,
}: {
	selectedUser: string;
	userPain: string;
	currentWorkaround: string;
	outcome: string;
	successLooksLike: string;
	showContext: boolean;
}) {
	return (
		<div className="space-y-3">
			{showContext ? (
				<FlowContextStrip
					selectedUser={selectedUser}
					userPain={userPain}
					outcome={outcome}
				/>
			) : null}
			<p className="text-sm leading-relaxed text-foreground [text-wrap:pretty]">
				Draw it on paper in 5-7 steps. Make the moment where the promise becomes
				real easy to spot.
			</p>
			<div className="grid gap-3 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
							Start
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<p className="text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
							{selectedUser} shows up with {currentWorkaround}.
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
							Value moment
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<p className="text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
							The user can see a usable result and knows the promise is real.
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
							End
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<p className="text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
							{successLooksLike}
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
