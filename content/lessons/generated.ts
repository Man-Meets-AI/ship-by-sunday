import { lesson0001WelcomeToShipBySundayLessonContent } from "@/content/lessons/00-01-welcome-to-ship-by-sunday";
import { lesson0002HowTheSprintWorksLessonContent } from "@/content/lessons/00-02-how-the-sprint-works";
import { lesson0101StartWithTheProblemLessonContent } from "@/content/lessons/01-01-start-with-the-problem";
import { lesson0102PickOneUserLessonContent } from "@/content/lessons/01-02-pick-one-user";
import { lesson0103DefineTheOutcomeLessonContent } from "@/content/lessons/01-03-define-the-outcome";
import { lesson0104LightResearchNotAThesisLessonContent } from "@/content/lessons/01-04-light-research-not-a-thesis";
import { lesson0105MapTheCoreFlowLessonContent } from "@/content/lessons/01-05-map-the-core-flow";
import { lesson0106KillScopeLessonContent } from "@/content/lessons/01-06-kill-scope";
import { lesson0107CeoBlockWrapUpLessonContent } from "@/content/lessons/01-07-ceo-block-wrap-up";
import { lesson0201FindReferencesFirstLessonContent } from "@/content/lessons/02-01-find-references-first";
import { lesson0202SketchBeforeSoftwareLessonContent } from "@/content/lessons/02-02-sketch-before-software";
import { lesson0203StoryboardTheJourneyLessonContent } from "@/content/lessons/02-03-storyboard-the-journey";
import { lesson0204FigmaBasicsForSpeedLessonContent } from "@/content/lessons/02-04-figma-basics-for-speed";
import { lesson0205TurnSketchesIntoRoughScreensLessonContent } from "@/content/lessons/02-05-turn-sketches-into-rough-screens";
import { lesson0206ChooseAVisualDirectionLessonContent } from "@/content/lessons/02-06-choose-a-visual-direction";
import { lesson0207DesignBlockWrapUpLessonContent } from "@/content/lessons/02-07-design-block-wrap-up";
import { lesson0301BuildFromTheBriefLessonContent } from "@/content/lessons/03-01-build-from-the-brief";
import { lesson0302SetUpTheEnvironmentLessonContent } from "@/content/lessons/03-02-set-up-the-environment";
import { lesson0303BriefTheAgentCorrectlyLessonContent } from "@/content/lessons/03-03-brief-the-agent-correctly";
import { lesson0304BuildTheCoreFlowLessonContent } from "@/content/lessons/03-04-build-the-core-flow";
import { lesson0305DebugWithoutSpiralingLessonContent } from "@/content/lessons/03-05-debug-without-spiraling";
import { lesson0306BuildBlockWrapUpLessonContent } from "@/content/lessons/03-06-build-block-wrap-up";
import { lesson0401ShipTheCoreNotTheFantasyLessonContent } from "@/content/lessons/04-01-ship-the-core-not-the-fantasy";
import { lesson0402DeployTheAppLessonContent } from "@/content/lessons/04-02-deploy-the-app";
import { lesson0403RecordASimpleDemoLessonContent } from "@/content/lessons/04-03-record-a-simple-demo";
import { lesson0404SendItToRealHumansLessonContent } from "@/content/lessons/04-04-send-it-to-real-humans";
import { lesson0405CaptureFeedbackAndPlanVersionTwoLessonContent } from "@/content/lessons/04-05-capture-feedback-and-plan-version-two";
import { lesson0406FinalWrapLessonContent } from "@/content/lessons/04-06-final-wrap";
import type { LessonContent } from "@/content/lessons/types";

export const authoredLessonContent = [
	lesson0001WelcomeToShipBySundayLessonContent,
	lesson0002HowTheSprintWorksLessonContent,
	lesson0101StartWithTheProblemLessonContent,
	lesson0102PickOneUserLessonContent,
	lesson0103DefineTheOutcomeLessonContent,
	lesson0104LightResearchNotAThesisLessonContent,
	lesson0105MapTheCoreFlowLessonContent,
	lesson0106KillScopeLessonContent,
	lesson0107CeoBlockWrapUpLessonContent,
	lesson0201FindReferencesFirstLessonContent,
	lesson0202SketchBeforeSoftwareLessonContent,
	lesson0203StoryboardTheJourneyLessonContent,
	lesson0204FigmaBasicsForSpeedLessonContent,
	lesson0205TurnSketchesIntoRoughScreensLessonContent,
	lesson0206ChooseAVisualDirectionLessonContent,
	lesson0207DesignBlockWrapUpLessonContent,
	lesson0301BuildFromTheBriefLessonContent,
	lesson0302SetUpTheEnvironmentLessonContent,
	lesson0303BriefTheAgentCorrectlyLessonContent,
	lesson0304BuildTheCoreFlowLessonContent,
	lesson0305DebugWithoutSpiralingLessonContent,
	lesson0306BuildBlockWrapUpLessonContent,
	lesson0401ShipTheCoreNotTheFantasyLessonContent,
	lesson0402DeployTheAppLessonContent,
	lesson0403RecordASimpleDemoLessonContent,
	lesson0404SendItToRealHumansLessonContent,
	lesson0405CaptureFeedbackAndPlanVersionTwoLessonContent,
	lesson0406FinalWrapLessonContent,
] as const satisfies readonly LessonContent[];
