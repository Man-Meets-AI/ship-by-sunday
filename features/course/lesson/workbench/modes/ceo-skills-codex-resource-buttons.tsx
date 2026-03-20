import Link from "next/link";

import { Button } from "@/components/ui/button";
import { courseResourceConfig, routeConfig } from "@/config/product";

export function CeoSkillsCodexResourceButtons() {
	const { starterRepo, codexLesson } = courseResourceConfig;

	return (
		<div className="flex flex-wrap gap-2">
			<Button variant="secondary" size="sm" asChild>
				<a href={starterRepo.url} target="_blank" rel="noreferrer">
					Open template
				</a>
			</Button>
			<Button variant="secondary" size="sm" asChild>
				<a
					href={codexLesson.openaiSkillsPackZip}
					target="_blank"
					rel="noreferrer"
				>
					Download skills pack
				</a>
			</Button>
			<Button variant="secondary" size="sm" asChild>
				<a href={codexLesson.figmaMcpDocs} target="_blank" rel="noreferrer">
					Figma + Codex (MCP)
				</a>
			</Button>
			<Button variant="outline" size="sm" asChild>
				<Link href={routeConfig.docs}>Setup docs</Link>
			</Button>
		</div>
	);
}
