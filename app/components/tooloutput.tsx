import {
  ChartType,
  LineChart as LineChartType,
  Result,
} from "@e2b/code-interpreter";
import { useState } from "react";
import { ToolResult } from "../lib/types";
import ReactECharts, { EChartsOption } from "echarts-for-react";

export function ToolOutput({ result }: { result: ToolResult | undefined }) {
  const [viewMode, setViewMode] = useState<"static" | "interactive">("static");

  if (!result) return null;
  const toolResult = result[0].result;

  return toolResult !== undefined
    ? toolResult.results.map((result: Result, index: number) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="flex justify-end">
            <button
              className={`px-2 border-b font-semibold text-sm ${
                viewMode === "static" ? "border-orange-500" : ""
              }`}
              onClick={() => setViewMode("static")}
            >
              Static
            </button>
            <button
              className={`px-2 border-b font-semibold text-sm ${
                viewMode === "interactive" ? "border-orange-500" : ""
              }`}
              onClick={() => setViewMode("interactive")}
            >
              Interactive
            </button>
          </div>
          <RenderResult result={result} viewMode={viewMode} />
        </div>
      ))
    : null;
}

function RenderResult({
  result,
  viewMode,
}: {
  result: Result;
  viewMode: "static" | "interactive";
}) {
  if (viewMode === "static" && result.png) {
    return <img src={`data:image/png;base64,${result.png}`} alt="plot" />;
  }

  if (viewMode === "interactive" && result.extra.chart) {
    const chart = result.extra.chart;
    if (chart.type === "line") {
      const data = (chart as LineChartType).elements.map((e) => {
        return {
          label: e.label,
          type: "line",
          data: e.points.map((p: [number, number]) => ({
            x: p[0],
            y: p[1],
          })),
        };
      });

      const options: EChartsOption = {
        title: {
          text: chart.title,
        },
        grid: { top: 8, right: 8, bottom: 24, left: 36 },
        xAxis: {
          type: "category",
          name: chart.x_label,
          data: data[0].data.map((d: { x: number }) => d.x),
          nameLocation: "middle",
        },
        yAxis: {
          name: chart.y_label,
          nameLocation: "middle",
        },
        legend: {},
        series: data.map((d) => ({
          name: d.label,
          data: d.data.map((d: { y: number }) => d.y),
          type: d.type,
        })),
        tooltip: {
          trigger: "axis",
        },
      };

      return <ReactECharts option={options} />;
    }

    // if (chart.type === "superchart") {
    //   return chart.elements.map((e) => {
    //     return <RenderResult result={e} viewMode={viewMode} />;
    //   });
    // }
  }

  return <pre>{JSON.stringify(result, null, 2)}</pre>;
}
