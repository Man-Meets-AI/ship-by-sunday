import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
	"support retention maintenance",
	{ hours: 6 },
	internal.support.runSupportRetentionMaintenance,
	{},
);

export default crons;
