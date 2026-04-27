import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	courseResourceConfig,
	routeConfig,
	starterRepoConfig,
} from "@/config/product";

const CHATGPT_URL = "https://chatgpt.com";
const CANVA_URL = "https://www.canva.com";

export function CodexMarketingSiteDependenciesCard() {
	const docsRoot = routeConfig.docs;

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Before you start</CardTitle>
				<CardDescription>
					You need an <strong>active ChatGPT subscription</strong> (or
					equivalent) for the prompt-and-refine loop. Everything else supports
					the same workflow.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<div className="flex flex-wrap gap-1.5">
					<Badge variant="secondary">Figma</Badge>
					<Badge variant="secondary">ChatGPT subscription</Badge>
					<Badge variant="secondary">Blog / articles</Badge>
					<Badge variant="secondary">Marketing site repo</Badge>
					<Badge variant="outline">Canva (optional)</Badge>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button variant="outline" size="sm" asChild>
						<a href={CHATGPT_URL} target="_blank" rel="noreferrer">
							Open ChatGPT
							<ExternalLink className="size-3.5 opacity-70" aria-hidden />
						</a>
					</Button>
					<Button variant="outline" size="sm" asChild>
						<a
							href={courseResourceConfig.figjam.workspace}
							target="_blank"
							rel="noreferrer"
						>
							Figma board
							<ExternalLink className="size-3.5 opacity-70" aria-hidden />
						</a>
					</Button>
					<Button variant="outline" size="sm" asChild>
						<a href={starterRepoConfig.url} target="_blank" rel="noreferrer">
							Starter repo
							<ExternalLink className="size-3.5 opacity-70" aria-hidden />
						</a>
					</Button>
					<Button variant="outline" size="sm" asChild>
						<a href={docsRoot} target="_blank" rel="noreferrer">
							Docs (mine for voice)
							<ExternalLink className="size-3.5 opacity-70" aria-hidden />
						</a>
					</Button>
					<Button variant="outline" size="sm" asChild>
						<a href={CANVA_URL} target="_blank" rel="noreferrer">
							Canva
							<ExternalLink className="size-3.5 opacity-70" aria-hidden />
						</a>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
