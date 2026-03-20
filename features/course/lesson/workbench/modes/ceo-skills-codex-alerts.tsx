import { Lightbulb } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function CeoSkillsCodexAlerts() {
	return (
		<div className="space-y-3">
			<Alert>
				<AlertTitle>Skills lists feel huge</AlertTitle>
				<AlertDescription className="leading-relaxed">
					That is normal. For this sprint, stay on the{" "}
					<span className="font-medium text-foreground">
						course-recommended starter stack
					</span>{" "}
					— you do not need to install everything you see.
				</AlertDescription>
			</Alert>
			<Alert>
				<Lightbulb />
				<AlertTitle>Look for UX design crit</AlertTitle>
				<AlertDescription className="leading-relaxed">
					In the video, the instructor points at the{" "}
					<span className="font-medium text-foreground">
						purple UX design crit
					</span>{" "}
					example in the skills UI—use it as the anchor for what a “skill job”
					looks like in practice.
				</AlertDescription>
			</Alert>
		</div>
	);
}
