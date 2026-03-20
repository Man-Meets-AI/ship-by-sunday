"use client";

import * as HeatGraph from "heat-graph";
import { useTheme } from "next-themes";

const LIGHT_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
const DARK_COLORS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

export function GitHubActivityGraph({
  data,
}: {
  data: HeatGraph.DataPoint[];
}) {
  const { resolvedTheme } = useTheme();
  const colors = resolvedTheme === "dark" ? DARK_COLORS : LIGHT_COLORS;

  return (
    <HeatGraph.Root data={data} weekStart="monday" colorScale={colors}>
      <div className="flex flex-col gap-2">
        <div className="relative">
          <HeatGraph.MonthLabels>
            {({ label, totalWeeks }) => (
              <span
                className="absolute top-0 text-xs text-muted-foreground"
                style={{ left: `${(label.column / totalWeeks) * 100}%` }}
              >
                {HeatGraph.MONTH_SHORT[label.month]}
              </span>
            )}
          </HeatGraph.MonthLabels>
        </div>

        <div className="mt-5 flex gap-2">
          <div className="flex flex-col justify-around pr-1">
            <HeatGraph.DayLabels>
              {({ label }) => {
                if (label.dayOfWeek % 2 === 0) return null;
                return (
                  <span className="text-xs leading-none text-muted-foreground">
                    {HeatGraph.DAY_SHORT[label.dayOfWeek]}
                  </span>
                );
              }}
            </HeatGraph.DayLabels>
          </div>

          <HeatGraph.Grid className="flex-1 gap-[3px]">
            {() => <HeatGraph.Cell className="aspect-square rounded-[2px]" />}
          </HeatGraph.Grid>
        </div>

        <div className="flex items-center justify-end gap-1.5">
          <span className="text-xs text-muted-foreground">Less</span>
          <HeatGraph.Legend>
            {() => (
              <HeatGraph.LegendLevel className="size-2.5 rounded-[2px]" />
            )}
          </HeatGraph.Legend>
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </div>

      <HeatGraph.Tooltip
        side="top"
        sideOffset={8}
        className="rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md"
      >
        {({ cell }) => (
          <span>
            <strong>{cell.count}</strong>{" "}
            {cell.count === 1 ? "contribution" : "contributions"} on{" "}
            {cell.date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
      </HeatGraph.Tooltip>
    </HeatGraph.Root>
  );
}
