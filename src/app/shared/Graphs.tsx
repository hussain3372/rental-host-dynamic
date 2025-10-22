"use client";
import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController,
  DoughnutController,
  Plugin,
  ChartType,
  ChartData,
  ChartOptions,
  Chart,
  Filler,
  TooltipModel
} from "chart.js";
import { Chart as ReactChart } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  LineController,
  BarController,
  DoughnutController,
  Title,
  Tooltip,
  Legend,
  Filler
);

export type GlobalGraphProps = {
  type?: ChartType;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?:
    | string
    | string[]
    | ((context: { chart: Chart }) => CanvasGradient | string);
    borderColor?: string;
    fill?: boolean;
    tension?: number;
    pointRadius?: number;
  }[];
  stacked?: boolean;
  centerText?: { label: string; value: string };
  showStripedBars?: boolean;
  segmentedBars?: boolean;

  barThickness?: number; 
  barGap?: number; 
  roundedBars?: boolean; 
  showYAxis?: boolean;
   tooltipVariant?: 'default' | 'percentage';
    yAxisMax?: number;
};

interface BarExtended extends BarElement {
  x: number;
  y: number;
  base: number;
  width: number;
}

interface ArcExtended extends ArcElement {
  startAngle: number;
  endAngle: number;
  outerRadius: number;
}

export default function GlobalGraph({
  type = "bar",
  labels,
  datasets,
  stacked = false,
  centerText,
  barThickness,
  barGap,
  roundedBars,
  showStripedBars = false,
  showYAxis = false,
    tooltipVariant = 'default',
    yAxisMax,

}: GlobalGraphProps) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ UNIFIED RADIUS: Define once and use everywhere
  const getRadius = () => {
    if (roundedBars) {
      // For fully rounded bars, use much larger radius
      return isSmallScreen ? 15 : 20; // Increased for full rounding
    }
    // Default radius for other cases
    return isSmallScreen ? 3 : 8;
  };

  const RADIUS = getRadius();
  const GAP = 8;

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radii: { tl: number; tr: number; br: number; bl: number }
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radii.tl, y);
    ctx.lineTo(x + width - radii.tr, y);
    if (radii.tr > 0) {
      ctx.quadraticCurveTo(x + width, y, x + width, y + radii.tr);
    }
    ctx.lineTo(x + width, y + height - radii.br);
    if (radii.br > 0) {
      ctx.quadraticCurveTo(x + width, y + height, x + width - radii.br, y + height);
    }
    ctx.lineTo(x + radii.bl, y + height);
    if (radii.bl > 0) {
      ctx.quadraticCurveTo(x, y + height, x, y + height - radii.bl);
    }
    ctx.lineTo(x, y + radii.tl);
    if (radii.tl > 0) {
      ctx.quadraticCurveTo(x, y, x + radii.tl, y);
    }
    ctx.closePath();
  };

  const stripedBarsPlugin: Plugin<"bar"> = {
    id: "stripedBars",
    beforeDatasetsDraw(chart) {
      if (showStripedBars && type === "bar") {
        chart.getDatasetMeta(0).data.forEach((bar) => {
          bar.options = bar.options || {};
          bar.options.backgroundColor = 'rgba(0,0,0,0)';
        });
        if (chart.getDatasetMeta(1)) {
          chart.getDatasetMeta(1).data.forEach((bar) => {
            bar.options = bar.options || {};
            bar.options.backgroundColor = 'rgba(0,0,0,0)';
          });
        }
      }
    },
    afterDatasetsDraw(chart) {
      if (showStripedBars && type === "bar") {
        const ctx = chart.ctx;

        datasets.forEach((dataset, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex);
          const color = dataset.backgroundColor as string;

          meta.data.forEach((bar) => {
            // @ts-expect-error - Accessing internal chart.js bar properties intentionally
            if (bar.y !== bar.base) {
              const x = bar.x;

              // @ts-expect-error - chart.js internal property
              const width = bar.width;
              const y = bar.y;
              // @ts-expect-error - chart.js internal property
              const height = bar.base - bar.y;

              ctx.save();
              ctx.fillStyle = color;

              // ✅ Use the unified RADIUS
              drawRoundedRect(
                ctx,
                x - width / 2,
                y,
                width,
                height,
                { tl: RADIUS, tr: RADIUS, br: RADIUS, bl: RADIUS }
              );
              ctx.fill();

              // Draw horizontal stripes
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
              ctx.lineWidth = 1;
              const stripeSpacing = 4;

              for (let i = y; i < y + height; i += stripeSpacing) {
                ctx.beginPath();
                ctx.moveTo(x - width / 2, i);
                ctx.lineTo(x + width / 2, i);
                ctx.stroke();
              }

              ctx.restore();
            }
          });
        });
      }
    },
  };

  const stackedBarGapPlugin: Plugin<"bar"> = {
    id: "stackedBarGap",
    beforeDatasetsDraw(chart) {
      if (stacked && type === "bar" && datasets.length > 1 && !showStripedBars) {
        const meta0 = chart.getDatasetMeta(0);
        const meta1 = chart.getDatasetMeta(1);

        meta0.data.forEach((bar) => {
          bar.options = bar.options || {};
          bar.options.backgroundColor = 'rgba(0,0,0,0)';
        });

        meta1.data.forEach((bar) => {
          bar.options = bar.options || {};
          bar.options.backgroundColor = 'rgba(0,0,0,0)';
        });
      }
    },
    afterDatasetsDraw(chart) {
      if (stacked && type === "bar" && datasets.length > 1 && !showStripedBars) {
        const ctx = chart.ctx;
        const meta0 = chart.getDatasetMeta(0);
        const meta1 = chart.getDatasetMeta(1);

        meta0.data.forEach((bar, index: number) => {
          const topBar = meta1.data[index];

          // @ts-expect-error - Accessing internal Chart.js bar properties intentionally
          if (bar && topBar && bar.y !== bar.base && topBar.y !== topBar.base) {
            const x = bar.x;

            // @ts-expect-error - chart.js internal property
            const width = bar.width;
            const bottomBarY = bar.y;
            // @ts-expect-error - chart.js internal property
            const bottomBarHeight = bar.base - bar.y;
            const topBarY = topBar.y;
            // @ts-expect-error - chart.js internal property
            const topBarBottom = topBar.base;
            const topBarHeight = topBarBottom - topBarY - GAP;

            ctx.save();

            ctx.fillStyle = datasets[0].backgroundColor as string;
            // ✅ Use the unified RADIUS
            drawRoundedRect(
              ctx,
              x - width / 2,
              bottomBarY,
              width,
              bottomBarHeight,
              { tl: RADIUS, tr: RADIUS, br: RADIUS, bl: RADIUS }
            );
            ctx.fill();

            ctx.fillStyle = datasets[1].backgroundColor as string;
            // ✅ Use the unified RADIUS
            drawRoundedRect(
              ctx,
              x - width / 2,
              topBarY,
              width,
              topBarHeight,
              { tl: RADIUS, tr: RADIUS, br: RADIUS, bl: RADIUS }
            );
            ctx.fill();

            ctx.restore();
          }
        });
      }
    },
  };

  const centerTextPlugin: Plugin<"doughnut"> = {
    id: "centerTextPlugin",
    afterDraw: (chart) => {
      if (type === "doughnut" && centerText && chart.chartArea) {
        const { ctx, chartArea } = chart;
        const { left, right, top, bottom } = chartArea;
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;

        ctx.save();

        ctx.font = "400 14px sans-serif";
        ctx.font = "700 16px sans-serif";

        const backgroundWidth = 100;
        const backgroundHeight = 100;

        const cornerRadius = backgroundHeight / 2;

        // Draw background with #2D2D2D color and full roundness
        ctx.fillStyle = "#2D2D2D";
        ctx.beginPath();
        ctx.roundRect(
          centerX - backgroundWidth / 2,
          centerY - backgroundHeight / 2,
          backgroundWidth,
          backgroundHeight,
          cornerRadius
        );
        ctx.fill();

        // Draw title text
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.font = "400 14px sans-serif";
        ctx.fillText(centerText.label, centerX, centerY - 15);

        // Draw value text
        ctx.fillStyle = "#ffffff";
        ctx.font = "700 16px sans-serif";
        ctx.fillText(centerText.value, centerX, centerY + 15);

        ctx.restore();
      }
    },
  };

  const doughnutHoverLabelPlugin: Plugin<"doughnut"> = {
    id: "doughnutHoverLabel",
    afterDraw: (chart) => {
      if (type === "doughnut") {
        const activeElements = chart.getActiveElements();

        if (activeElements.length > 0) {
          const { ctx, chartArea } = chart;
          const { left, right, top, bottom } = chartArea;
          const centerX = (left + right) / 2;
          const centerY = (top + bottom) / 2;

          activeElements.forEach((element) => {
            const datasetIndex = element.datasetIndex;
            const index = element.index;
            const dataset = chart.data.datasets[datasetIndex];
            const value = dataset.data[index] as number;

            const _total = (dataset.data as number[]).reduce((acc, val) => acc + val, 0);
            const percentage = Math.round((value / _total) * 100);

            const meta = chart.getDatasetMeta(datasetIndex);
            const arc = meta.data[index] as ArcExtended;

            const startAngle = arc.startAngle;
            const endAngle = arc.endAngle;
            const midAngle = (startAngle + endAngle) / 2;
            const outerRadius = arc.outerRadius;

            const arcX = centerX + Math.cos(midAngle) * outerRadius;
            const arcY = centerY + Math.sin(midAngle) * outerRadius;

            const labelDistance = outerRadius + 45;
            const labelX = centerX + Math.cos(midAngle) * labelDistance;
            const labelY = centerY + Math.sin(midAngle) * labelDistance;

            const colors = dataset.backgroundColor as string[];
            const segmentColor = Array.isArray(colors) ? colors[index] : colors;

            ctx.save();

            ctx.strokeStyle = segmentColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(arcX, arcY);
            ctx.lineTo(labelX, labelY);
            ctx.stroke();

            ctx.fillStyle = segmentColor;
            ctx.beginPath();
            ctx.arc(labelX, labelY, 6, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.font = "700 15px sans-serif";
            ctx.textAlign = midAngle > Math.PI / 2 && midAngle < (3 * Math.PI) / 2 ? "right" : "left";
            ctx.textBaseline = "middle";
            const textOffset = midAngle > Math.PI / 2 && midAngle < (3 * Math.PI) / 2 ? -14 : 14;
            ctx.fillText(`${percentage}%`, labelX + textOffset, labelY);

            ctx.restore();
          });
        }
      }
    },
  };
// ✅ Default Tooltip (existing design)
const defaultTooltip = function (this: TooltipModel<ChartType>, args: { chart: Chart; tooltip: TooltipModel<ChartType> }) {
  const { chart, tooltip } = args;
  let tooltipEl = document.getElementById(`chartjs-custom-tooltip-${chart.id}`);

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.id = `chartjs-custom-tooltip-${chart.id}`;
    tooltipEl.style.position = "absolute";
    tooltipEl.style.pointerEvents = "none";
    tooltipEl.style.transition = "all .08s ease";
    tooltipEl.style.zIndex = "999";

    const parentNode = chart.canvas.parentNode as HTMLElement | null;
    if (parentNode) {
      parentNode.style.position = "relative";
      parentNode.appendChild(tooltipEl);
    }
  }

  if (!tooltip || tooltip.opacity === 0) {
    tooltipEl.style.opacity = "0";
    return;
  }

  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map((b) => b.lines);

    const innerHtml = `
    <div style="
      border-radius: 12px;
      background: var(--Base-Base-200, #2D2D2D);
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.25);
      padding: 12px;
      color: white;
      font-size: 12px;
    ">
      <div style="font-weight: 600; font-size: 13px; margin-bottom: 6px;">
        ${titleLines.map((title: string) => `${title} ${new Date().getFullYear()}`).join(", ")}
      </div>
      ${bodyLines
        .map((body: string[], i: number) => {
          const labelColor = tooltip.labelColors?.[i];
          const color = labelColor?.backgroundColor?.toString() || labelColor?.borderColor?.toString();
          const [label, value] = body[0].split(":");
          return `
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
              <span style="width:8px;height:8px;border-radius:2px;background:${color};"></span>
              <div style="display:flex;gap:29px;">
                <span>${label}</span>
                <span style="font-weight:600;">${value}</span>
              </div>
            </div>`;
        })
        .join("")}
    </div>
  `;

    tooltipEl.innerHTML = innerHtml;
  }

  if (tooltipEl) {
    const positionX = tooltip.caretX;
    const positionY = tooltip.caretY;

    let horizontalOffset = 10;
    let verticalOffset = -40;

    if (positionX > chart.width * 0.7) {
      horizontalOffset = -tooltip.width - 20;
    }

    if (positionY < 60) {
      verticalOffset = 20;
    }

    tooltipEl.style.opacity = "1";
    tooltipEl.style.left = `${positionX + horizontalOffset}px`;
    tooltipEl.style.top = `${positionY + verticalOffset}px`;
  }
};

// ✅ Percentage Tooltip (new design for your specific graph)
const percentageTooltip = function (this: TooltipModel<ChartType>, args: { chart: Chart; tooltip: TooltipModel<ChartType> }) {
  const { chart, tooltip } = args;
  let tooltipEl = document.getElementById(`chartjs-custom-tooltip-${chart.id}`);

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.id = `chartjs-custom-tooltip-${chart.id}`;
    tooltipEl.style.position = "absolute";
    tooltipEl.style.pointerEvents = "none";
    tooltipEl.style.transition = "all .08s ease";
    tooltipEl.style.zIndex = "999";

    const parentNode = chart.canvas.parentNode as HTMLElement | null;
    if (parentNode) {
      parentNode.style.position = "relative";
      parentNode.appendChild(tooltipEl);
    }
  }

  if (!tooltip || tooltip.opacity === 0) {
    tooltipEl.style.opacity = "0";
    return;
  }

  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map((b) => b.lines);

    let innerHtml = `
    <div style="
      border-radius: 12px;
      background: var(--Base-Base-200, #2D2D2D);
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.25);
      padding: 12px;
      color: white;
      font-size: 12px;
      min-width: 180px;
    ">
      <!-- ✅ Centered month and year with left yellow dot -->
      <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:8px;">
        <span style="width:8px;height:8px;border-radius:50%;background:#EFFC76;"></span>
        <span style="font-weight: 600; font-size: 13px;">
          ${titleLines.map((title: string) => `${title} ${new Date().getFullYear()}`).join(", ")}
        </span>
      </div>
    `;

    bodyLines.forEach((body: string[], i: number) => {
      const labelColor = tooltip.labelColors?.[i];
      const color = labelColor?.backgroundColor?.toString() || labelColor?.borderColor?.toString();
      const [, valueStr] = body[0].split(":");
      const value = parseInt(valueStr.replace(/[^0-9]/g, ''));

      innerHtml += `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="width:3px;height:17px;;background:${color};"></span>
            <span>${body[0].split(":")[0]}</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-weight:600;">${value.toLocaleString()}</span>
          </div>
        </div>`;
    });

   

    tooltipEl.innerHTML = innerHtml;
  }

  if (tooltipEl) {
    const positionX = tooltip.caretX;
    const positionY = tooltip.caretY;

    let horizontalOffset = 10;
    let verticalOffset = -40;

    if (positionX > chart.width * 0.7) {
      horizontalOffset = -tooltip.width - 20;
    }

    if (positionY < 60) {
      verticalOffset = 20;
    }

    tooltipEl.style.opacity = "1";
    tooltipEl.style.left = `${positionX + horizontalOffset}px`;
    tooltipEl.style.top = `${positionY + verticalOffset}px`;
  }
};

  // ✅ Responsive chart data
  const chartData: ChartData<ChartType> = {
    labels,
    datasets: datasets.map((ds) => {
      if (type === "bar") {
        return {
          ...ds,
          borderWidth: 0,
          borderSkipped: false as const,
          // thinner when requested or keep default
          barThickness: typeof barThickness !== "undefined" ? barThickness : (isSmallScreen ? 11 : 41),
          // barGap is a percent-like control (20 => more narrow bars / more gap)
          barPercentage: typeof barGap === "number" ? Math.max(0.2, 1 - barGap / 100) : 0.9,
          categoryPercentage: typeof barGap === "number" ? Math.max(0.2, 1 - barGap / 100) : 0.9,
          // full capsule when roundedBars is true
          borderRadius: roundedBars ? Number.MAX_VALUE : (roundedBars === false ? 0 : (isSmallScreen ? 6 : 8)),
        };
      } else if (type === "line") {
        return {
          ...ds,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          // For line charts, we'll handle the gradient in the plugin
          backgroundColor: typeof ds.backgroundColor === 'string' ? ds.backgroundColor : 'transparent',
          fill: ds.fill !== undefined ? ds.fill : true,
        };
      }
      return ds;
    }),
  };

 const baseOptions: ChartOptions<ChartType> = {
  responsive: true,
  maintainAspectRatio: false,

  interaction: {
    mode: "index",
    intersect: true,
  },
  plugins: {
    legend: {
      display: false,
      position: "bottom",
      labels: {
        color: "#fff",
        font: { size: 12 },
      },
      onClick: () => null,
    },
    tooltip: {
      enabled: false, // ✅ Disable default tooltip
      external: tooltipVariant === 'percentage' ? percentageTooltip : defaultTooltip, // ✅ Use selected tooltip
    },
  },
};
  if (type === "bar") {
  // ✅ Calculate dynamic max if yAxisMax is not provided
  const calculateMax = () => {
    if (yAxisMax !== undefined) return yAxisMax;
    
    // If Y-axis is hidden, don't limit the scale
    if (!showYAxis) return undefined;
    
    // Default to 5000 only when Y-axis is visible and no custom max provided
    return 5000;
  };

  baseOptions.scales = {
    x: {
      stacked,
      grid: { display: false },
      ticks: {
        color: "#9ca3af",
        font: { size: 12 },
        padding: 8,
      },
      border: { display: false },
      position: 'bottom',
    },
    y: {
      stacked,
      grid: { display: false },
      // ✅ Use dynamic max calculation
      max: calculateMax(),
      min: 0,
      beginAtZero: true,
      ticks: {
        display: showYAxis,
        color: "#9ca3af",
        font: { size: 12 },
        padding: 10,
        callback: function (value: string | number) {
          const num = typeof value === "number" ? value : parseFloat(String(value));
          // ✅ Only show specific values when Y-axis is visible
          if (showYAxis) {
            const allowedValues: Record<number, string> = {
              0: "0",
              1000: "1k", 
              2000: "2k",
              3000: "3k",
              4000: "4k",
              5000: "5k"
            };
            return allowedValues[num] || undefined;
          }
          // ✅ Return undefined when Y-axis is hidden
          return undefined;
        },
        stepSize: showYAxis ? 1000 : undefined,
        count: showYAxis ? 6 : undefined
      },
      border: { display: false },
      position: 'left',
      offset: false,
    },
  };
  
  baseOptions.layout = {
    padding: {
      bottom: 0,
      left: 0,
    }
  };
  
  baseOptions.elements = {
    bar: {
      borderSkipped: false,
      borderRadius: roundedBars ? Number.MAX_VALUE : 0,
    },
  };
}

  if (type === "line") {
    baseOptions.interaction = {
      mode: "index",
      intersect: false,
    };

    baseOptions.scales = {
      x: {
        grid: { display: false },
        ticks: {
          color: "#9ca3af",
          font: { size: 12 },
          padding: 8,
        },
        border: { display: true, color: "#374151" },
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: 50000,
        grid: { display: false },
        ticks: {
          display: true,
          color: "#9ca3af",
          font: { size: 12 },
          padding: 10,
          stepSize: 10000,
          callback: (value: string | number) => {
            const numValue = typeof value === "number" ? value : parseFloat(String(value));
            if (numValue === 0) return "$0";
            if (numValue >= 1000) return "$" + numValue / 1000 + "k";
            return "$" + numValue;
          },
        },
        border: { display: false },
        position: "left",
        grace: "0%",
      },
    };

    baseOptions.plugins = {
      ...baseOptions.plugins,
      tooltip: {
        enabled: false,
        external: function (this: TooltipModel<ChartType>, args: { chart: Chart; tooltip: TooltipModel<ChartType> }) {
          const { chart, tooltip } = args;
          if (!chart || !tooltip) return;

          let tooltipEl = document.getElementById(`chartjs-line-tooltip-${chart.id}`);
          if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            tooltipEl.id = `chartjs-line-tooltip-${chart.id}`;
            tooltipEl.style.position = "absolute";
            tooltipEl.style.pointerEvents = "none";
            tooltipEl.style.transition = "all .08s ease";
            tooltipEl.style.zIndex = "999";

            const parentNode = chart.canvas.parentNode as HTMLElement | null;
            if (parentNode) {
              parentNode.style.position = "relative";
              parentNode.appendChild(tooltipEl);
            }
          }

          if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = "0";
            return;
          }

          if (tooltip.body) {
            const titleLines = tooltip.title || [];
            const bodyLines = tooltip.body.map((b) => b.lines);

            const randomPercentage = (Math.random() * 10 - 5).toFixed(1);
            const sign = randomPercentage.startsWith("-") ? "-" : "+";
            const signColor = sign === "-" ? "#ef4444" : "#22c55e";
            const percentDisplay = `${Math.abs(parseFloat(randomPercentage))}%`;

            let innerHtml = `
            <div style="
              border-radius: 12px;
              background: #2D2D2D;
              box-shadow: 0 0 4px rgba(0,0,0,0.25);
              padding: 10px 12px;
              color: white;
              font-size: 12px;
              min-width: 150px;
            ">
          `;

            // ✅ Centered dot + month + year
            titleLines.forEach((title, i) => {
              const labelColor = tooltip.labelColors?.[i];
              const color = labelColor?.borderColor?.toString() || labelColor?.backgroundColor?.toString() || "#fff";

              innerHtml += `
              <div style="
                display:flex;
                align-items:center;
                justify-content:center;
                gap:6px;
                margin-bottom:10px;
                text-align:center;
              ">
                <span style="width:8px;height:8px;border-radius:50%;background:${color};"></span>
                <span style="font-weight:600;">${title} ${new Date().getFullYear()}</span>
              </div>
            `;
            });

            // ✅ Values row stays same
            bodyLines.forEach((body) => {
              const [, value] = body[0].split(":");
              const numValue = Number(value.replace(/[^0-9.-]+/g, ""));
              const formattedValue = "$" + numValue.toLocaleString();

              innerHtml += `
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
                <span style="font-weight:600;">${formattedValue}</span>
                <span>
                  <span style="color:${signColor};font-weight:700;">${sign}</span>
                  <span style="color:#d1d5db;">${percentDisplay}</span>
                </span>
              </div>
            `;
            });

            innerHtml += `</div>`;
            tooltipEl.innerHTML = innerHtml;
          }

          const { caretX, caretY } = tooltip;
          let offsetX = 10;
          let offsetY = -50;

          if (caretX > chart.width * 0.7) offsetX = -tooltip.width - 20;
          if (caretY < 60) offsetY = 20;

          tooltipEl.style.opacity = "1";
          tooltipEl.style.left = `${caretX + offsetX}px`;
          tooltipEl.style.top = `${caretY + offsetY}px`;
        },
      },
    };
  }



  if (type === "doughnut") {
    // @ts-expect-error - Doughnut chart specific configuration
    baseOptions.cutout = '60%';
    // @ts-expect-error - Doughnut chart specific configuration
    baseOptions.radius = '100%';
    // @ts-expect-error - Doughnut chart specific configuration
    baseOptions.spacing = 15;
    // @ts-expect-error - Doughnut chart specific configuration
    baseOptions.rotation = -90;
    // @ts-expect-error - Doughnut chart specific configuration
    baseOptions.circumference = 360;

    baseOptions.elements = {
      arc: {
        borderWidth: 0,
        borderAlign: 'center',
        borderRadius: RADIUS, // ✅ dynamic radius
      },
    };
  }
  const fullRoundedBarPlugin: Plugin<"bar"> = {
    id: "fullRoundedBarPlugin",
    beforeDatasetsDraw(chart) {
      // ✅ Make all bars transparent so only our custom drawing shows
      if (roundedBars && type === "bar") {
        chart.data.datasets.forEach((_, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex);
          meta.data.forEach((bar) => {
            bar.options = bar.options || {};
            bar.options.backgroundColor = 'rgba(0,0,0,0)';
          });
        });
      }
    },
    afterDatasetsDraw(chart) {
      if (!roundedBars || type !== "bar") return;

      const ctx = chart.ctx;
      const RADIUS = getRadius();

      chart.data.datasets.forEach((dataset, datasetIndex: number) => {
        const meta = chart.getDatasetMeta(datasetIndex);

        // Skip if dataset is hidden
        if (meta.hidden) return;

        meta.data.forEach((element) => {
          const bar = element as unknown as BarExtended;
          const x = bar.x;
          const width = bar.width;
          const left = x - width / 2;

          // Get bar dimensions
          const barY = bar.y;
          const barBase = bar.base;
          const barHeight = Math.abs(barBase - barY);

          // Skip if bar height is too small
          if (barHeight < 1) return;

          // Determine bar position in stack
          const isTopBar = stacked && datasetIndex === datasets.length - 1;
          const isBottomBar = stacked && datasetIndex === 0;
          const isMiddleBar = stacked && datasetIndex > 0 && datasetIndex < datasets.length - 1;
          const isSingleBar = !stacked || datasets.length === 1;

          ctx.save();
          
          // Handle backgroundColor which can be various types
          let fillColor = '#000000';
          if (typeof dataset.backgroundColor === 'string') {
            fillColor = dataset.backgroundColor;
          } else if (Array.isArray(dataset.backgroundColor) && dataset.backgroundColor.length > 0) {
            fillColor = dataset.backgroundColor[0] as string;
          }
          ctx.fillStyle = fillColor;

          // ✅ SEGMENT CONFIGURATION - Adjusted for proper rounded corners
          const SEGMENT_GAP = 3;
          const SEGMENT_HEIGHT = 2;

          const useSegments = true; // Force segments for all bars

          const totalSegmentHeight = SEGMENT_HEIGHT + SEGMENT_GAP;
          const maxSegments = Math.floor(barHeight / totalSegmentHeight);
          const actualSegments = Math.max(2, maxSegments);

          const totalSegmentsHeight = (SEGMENT_HEIGHT * actualSegments) + (SEGMENT_GAP * (actualSegments - 1));
          const verticalOffset = (barHeight - totalSegmentsHeight) / 2;
          const startY = barY + verticalOffset;

          // ✅ ALWAYS USE SEGMENTS
          if (useSegments) {
            for (let i = 0; i < actualSegments; i++) {
              const segmentY = startY + (i * totalSegmentHeight);

              ctx.save();
              
              // Handle backgroundColor
              let segmentFillColor = '#000000';
              if (typeof dataset.backgroundColor === 'string') {
                segmentFillColor = dataset.backgroundColor;
              } else if (Array.isArray(dataset.backgroundColor) && dataset.backgroundColor.length > 0) {
                segmentFillColor = dataset.backgroundColor[0] as string;
              }
              ctx.fillStyle = segmentFillColor;

              let corners = { tl: 0, tr: 0, br: 0, bl: 0 };

              const effectiveRadius = Math.min(RADIUS + 16, SEGMENT_HEIGHT / 1.2); // Even more rounded            
              if (isSingleBar) {
                if (i === 0) {
                  corners = { tl: effectiveRadius, tr: effectiveRadius, br: 0, bl: 0 };
                } else if (i === actualSegments - 1) {
                  corners = { tl: 0, tr: 0, br: effectiveRadius, bl: effectiveRadius };
                } else {
                  corners = { tl: 0, tr: 0, br: 0, bl: 0 };
                }
              } else if (isBottomBar) {
                if (i === actualSegments - 1) {
                  corners = { tl: 0, tr: 0, br: effectiveRadius, bl: effectiveRadius };
                } else {
                  corners = { tl: 0, tr: 0, br: 0, bl: 0 };
                }
              } else if (isTopBar) {
                if (i === 0) {
                  corners = { tl: effectiveRadius, tr: effectiveRadius, br: 0, bl: 0 };
                } else {
                  corners = { tl: 0, tr: 0, br: 0, bl: 0 };
                }
              } else {
                corners = { tl: 0, tr: 0, br: 0, bl: 0 };
              }

              drawRoundedRect(
                ctx,
                left,
                segmentY,
                width,
                SEGMENT_HEIGHT,
                corners
              );

              ctx.fill();
              ctx.restore();
            }
          } else {
            let adjustedY = barY;
            let adjustedHeight = barHeight;

            if (stacked && datasets.length > 1) {
              if (isBottomBar) {
                adjustedHeight = barHeight - GAP / 2;
              } else if (isTopBar) {
                adjustedY = barY + GAP / 2;
                adjustedHeight = barHeight - GAP / 2;
              } else if (isMiddleBar) {
                adjustedY = barY + GAP / 2;
                adjustedHeight = barHeight - GAP;
              }
            }

            const increasedRadius = RADIUS + 4; // ✅ Increased radius for solid bars

            // Draw solid bar
            if (isSingleBar) {
              drawRoundedRect(
                ctx,
                left,
                adjustedY,
                width,
                adjustedHeight,
                { tl: increasedRadius, tr: increasedRadius, br: increasedRadius, bl: increasedRadius }
              );
            } else if (isBottomBar) {
              drawRoundedRect(
                ctx,
                left,
                adjustedY,
                width,
                adjustedHeight,
                { tl: 0, tr: 0, br: increasedRadius, bl: increasedRadius }
              );
            } else if (isTopBar) {
              drawRoundedRect(
                ctx,
                left,
                adjustedY,
                width,
                adjustedHeight,
                { tl: increasedRadius, tr: increasedRadius, br: 0, bl: 0 }
              );
            } else {
              drawRoundedRect(
                ctx,
                left,
                adjustedY,
                width,
                adjustedHeight,
                { tl: 0, tr: 0, br: 0, bl: 0 }
              );
            }
            ctx.fill();
          }

          ctx.restore();
        });
      });
    },
  };
  const plugins = [];
  if (type === "doughnut" && centerText) plugins.push(centerTextPlugin);
  if (type === "doughnut") plugins.push(doughnutHoverLabelPlugin);

  // ✅ IMPORTANT: Use only ONE bar plugin at a time to avoid conflicts
  if (type === "bar" && roundedBars) {
    plugins.push(fullRoundedBarPlugin);
  } else if (type === "bar" && stacked && !roundedBars) {
    plugins.push(stackedBarGapPlugin);
  } else if (type === "bar" && showStripedBars && !roundedBars) {
    plugins.push(stripedBarsPlugin);
  }

  return (
    <div style={{ height: "270px", width: "100%" }}>
      <ReactChart
        key={isSmallScreen ? "small" : "large"} // ✅ Force re-render on screen size change
        type={type}
        data={chartData}
        options={baseOptions}
        plugins={plugins}
      />
    </div>
  );
}