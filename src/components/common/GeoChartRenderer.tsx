import React from "react";
import { GeoChartConfig } from "../../types";

interface GeoChartRendererProps {
  chart: GeoChartConfig;
  className?: string;
}

export const GeoChartRenderer: React.FC<GeoChartRendererProps> = ({ chart, className = "" }) => {
  const {
    type,
    title,
    subTitle,
    categories,
    datasets,
    leftYAxisUnit,
    rightYAxisUnit,
    source,
  } = chart;

  // Palette of crisp Geography textbook colors
  const defaultColors = [
    "#2563eb", // blue
    "#059669", // emerald green
    "#dc2626", // red
    "#d97706", // amber
    "#7c3aed", // violet
    "#0891b2", // cyan
    "#ea580c", // orange
  ];

  // Helper to format numbers in Vietnamese locale (e.g., 33,8 or 1 400,0)
  const formatNum = (num: number) => {
    return num.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
  };

  // Render PIE / PIE_MULTI Charts
  if (type === "PIE" || type === "PIE_MULTI") {
    const isMultiPie = datasets.length > 1;
    return (
      <div className={`my-4 bg-slate-50/80 rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-2xs ${className}`}>
        {title && (
          <h4 className="text-center font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wide mb-1">
            {title}
          </h4>
        )}
        {subTitle && (
          <p className="text-center text-[11px] text-slate-500 font-medium italic mb-4">
            {subTitle}
          </p>
        )}

        <div className={`grid ${isMultiPie ? "grid-cols-1 md:grid-cols-2 gap-6" : "grid-cols-1"} items-center justify-center`}>
          {datasets.map((dataset, dIdx) => {
            const total = dataset.data.reduce((acc, v) => acc + v, 0);
            let cumulativeAngle = 0;

            const slices = dataset.data.map((val, idx) => {
              const fraction = total > 0 ? val / total : 0;
              const angle = fraction * 360;
              const startAngle = cumulativeAngle;
              const endAngle = cumulativeAngle + angle;
              cumulativeAngle = endAngle;

              // Arc calculation
              const startRad = ((startAngle - 90) * Math.PI) / 180;
              const endRad = ((endAngle - 90) * Math.PI) / 180;
              const x1 = 120 + 85 * Math.cos(startRad);
              const y1 = 120 + 85 * Math.sin(startRad);
              const x2 = 120 + 85 * Math.cos(endRad);
              const y2 = 120 + 85 * Math.sin(endRad);
              const largeArcFlag = angle > 180 ? 1 : 0;

              // Mid angle for text label
              const midRad = (((startAngle + endAngle) / 2 - 90) * Math.PI) / 180;
              const textX = 120 + 58 * Math.cos(midRad);
              const textY = 120 + 58 * Math.sin(midRad);

              const pathData =
                angle >= 359.99
                  ? `M 120,35 A 85,85 0 1,0 120,205 A 85,85 0 1,0 120,35`
                  : `M 120,120 L ${x1},${y1} A 85,85 0 ${largeArcFlag},1 ${x2},${y2} Z`;

              const color = dataset.color || defaultColors[idx % defaultColors.length];

              return {
                label: categories[idx] || `Mục ${idx + 1}`,
                val,
                percentage: (fraction * 100).toFixed(1),
                pathData,
                color,
                textX,
                textY,
              };
            });

            return (
              <div key={dIdx} className="flex flex-col items-center">
                {isMultiPie && (
                  <span className="text-xs font-bold text-slate-800 mb-2 px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    {dataset.label}
                  </span>
                )}
                <div className="w-60 h-60 relative">
                  <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-xs">
                    <circle cx="120" cy="120" r="85" fill="#f1f5f9" />
                    {slices.map((s, sIdx) => (
                      <g key={sIdx}>
                        <path
                          d={s.pathData}
                          fill={s.color}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="hover:opacity-90 transition-opacity"
                        />
                        {parseFloat(s.percentage) >= 4 && (
                          <text
                            x={s.textX}
                            y={s.textY}
                            fill="#ffffff"
                            fontSize="11"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="select-none pointer-events-none drop-shadow-sm font-mono"
                          >
                            {formatNum(s.val)}%
                          </text>
                        )}
                      </g>
                    ))}
                    {/* Circle border accent */}
                    <circle cx="120" cy="120" r="85" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="font-bold text-slate-700">Chú giải:</span>
          {categories.map((cat, cIdx) => {
            const color = defaultColors[cIdx % defaultColors.length];
            return (
              <div key={cIdx} className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                <span className="w-3.5 h-3.5 rounded-xs" style={{ backgroundColor: color }} />
                <span className="text-slate-700 font-medium">{cat}</span>
              </div>
            );
          })}
        </div>

        {source && (
          <p className="text-right text-[11px] text-slate-400 font-medium italic mt-3">
            ({source})
          </p>
        )}
      </div>
    );
  }

  // Bar, Grouped Bar, Line, Combo Bar & Line
  const isCombo = type === "COMBO_BAR_LINE";
  const hasRightAxis = Boolean(rightYAxisUnit) || isCombo;

  // SVG Dimension setups
  const svgWidth = 600;
  const svgHeight = 320;
  const padding = {
    top: 40,
    right: hasRightAxis ? 55 : 30,
    bottom: 50,
    left: 65,
  };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Left Axis Max and values
  const leftDatasets = datasets.filter((d) => !hasRightAxis || d.yAxisSide !== "right");
  const rightDatasets = hasRightAxis ? datasets.filter((d) => d.yAxisSide === "right") : [];

  const leftMaxRaw = Math.max(
    ...leftDatasets.flatMap((d) => d.data),
    10
  );
  // Round left max up to nice round number
  const leftMax = Math.ceil(leftMaxRaw * 1.15);

  const rightMaxRaw = rightDatasets.length > 0 ? Math.max(...rightDatasets.flatMap((d) => d.data), 1) : 100;
  const rightMax = Math.ceil(rightMaxRaw * 1.15);

  // Y-axis grid ticks (4 intervals)
  const ticksCount = 4;
  const leftTicks = Array.from({ length: ticksCount + 1 }, (_, i) => (leftMax / ticksCount) * i);
  const rightTicks = Array.from({ length: ticksCount + 1 }, (_, i) => (rightMax / ticksCount) * i);

  const numCategories = categories.length;
  const categoryWidth = plotWidth / numCategories;

  return (
    <div className={`my-4 bg-slate-50/90 rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-2xs ${className}`}>
      {title && (
        <h4 className="text-center font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wide mb-1">
          {title}
        </h4>
      )}
      {subTitle && (
        <p className="text-center text-[11px] text-slate-500 font-medium italic mb-2">
          {subTitle}
        </p>
      )}

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-2xl mx-auto h-auto select-none"
          style={{ minWidth: "340px" }}
        >
          <defs>
            {/* Arrow marker for axes */}
            <marker
              id="geo-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
            </marker>
          </defs>

          {/* Left Y Axis Unit */}
          {leftYAxisUnit && (
            <text
              x={padding.left - 8}
              y={padding.top - 18}
              fill="#475569"
              fontSize="10.5"
              fontWeight="bold"
              textAnchor="end"
            >
              ({leftYAxisUnit})
            </text>
          )}

          {/* Right Y Axis Unit */}
          {hasRightAxis && rightYAxisUnit && (
            <text
              x={svgWidth - padding.right + 8}
              y={padding.top - 18}
              fill="#dc2626"
              fontSize="10.5"
              fontWeight="bold"
              textAnchor="start"
            >
              ({rightYAxisUnit})
            </text>
          )}

          {/* Grid lines and Left Ticks */}
          {leftTicks.map((tickVal, idx) => {
            const yPos = padding.top + plotHeight - (tickVal / leftMax) * plotHeight;
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={svgWidth - padding.right}
                  y2={yPos}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={idx === 0 ? "0" : "3,3"}
                />
                <text
                  x={padding.left - 8}
                  y={yPos + 3.5}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {formatNum(tickVal)}
                </text>
              </g>
            );
          })}

          {/* Right Ticks if combo / dual axis */}
          {hasRightAxis &&
            rightTicks.map((tickVal, idx) => {
              const yPos = padding.top + plotHeight - (tickVal / rightMax) * plotHeight;
              return (
                <g key={idx}>
                  <text
                    x={svgWidth - padding.right + 8}
                    y={yPos + 3.5}
                    fill="#dc2626"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="start"
                  >
                    {formatNum(tickVal)}
                  </text>
                </g>
              );
            })}

          {/* Left Y Axis line */}
          <line
            x1={padding.left}
            y1={padding.top + plotHeight}
            x2={padding.left}
            y2={padding.top - 10}
            stroke="#475569"
            strokeWidth="1.5"
            markerEnd="url(#geo-arrow)"
          />

          {/* Right Y Axis line if dual */}
          {hasRightAxis && (
            <line
              x1={svgWidth - padding.right}
              y1={padding.top + plotHeight}
              x2={svgWidth - padding.right}
              y2={padding.top - 10}
              stroke="#dc2626"
              strokeWidth="1.5"
              markerEnd="url(#geo-arrow)"
            />
          )}

          {/* X Axis line */}
          <line
            x1={padding.left}
            y1={padding.top + plotHeight}
            x2={svgWidth - padding.right + 15}
            y2={padding.top + plotHeight}
            stroke="#475569"
            strokeWidth="1.5"
            markerEnd="url(#geo-arrow)"
          />

          {/* X Axis Label */}
          <text
            x={svgWidth - padding.right + 20}
            y={padding.top + plotHeight + 14}
            fill="#475569"
            fontSize="10"
            fontWeight="bold"
          >
            (Năm)
          </text>

          {/* X Axis Categories */}
          {categories.map((cat, cIdx) => {
            const centerX = padding.left + cIdx * categoryWidth + categoryWidth / 2;
            return (
              <g key={cIdx}>
                <line
                  x1={centerX}
                  y1={padding.top + plotHeight}
                  x2={centerX}
                  y2={padding.top + plotHeight + 5}
                  stroke="#475569"
                  strokeWidth="1"
                />
                <text
                  x={centerX}
                  y={padding.top + plotHeight + 18}
                  fill="#1e293b"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {cat}
                </text>
              </g>
            );
          })}

          {/* 1. RENDER BARS (Single or Grouped) */}
          {leftDatasets
            .filter((d) => d.type !== "line" && (type === "BAR_SINGLE" || type === "BAR_GROUPED" || isCombo))
            .map((dataset, dIdx, barArr) => {
              const numBars = barArr.length;
              const barGroupWidth = categoryWidth * 0.65;
              const singleBarWidth = barGroupWidth / numBars;
              const barColor = dataset.color || defaultColors[dIdx % defaultColors.length];

              return (
                <g key={dIdx}>
                  {dataset.data.map((val, cIdx) => {
                    const groupStartX = padding.left + cIdx * categoryWidth + (categoryWidth - barGroupWidth) / 2;
                    const barX = groupStartX + dIdx * singleBarWidth;
                    const barHeight = (val / leftMax) * plotHeight;
                    const barY = padding.top + plotHeight - barHeight;

                    return (
                      <g key={cIdx}>
                        {/* Bar */}
                        <rect
                          x={barX + 2}
                          y={barY}
                          width={Math.max(singleBarWidth - 4, 10)}
                          height={Math.max(barHeight, 0)}
                          fill={barColor}
                          rx="2"
                          className="hover:opacity-90 transition-opacity"
                        />
                        {/* Value label on top of bar */}
                        <text
                          x={barX + singleBarWidth / 2}
                          y={barY - 5}
                          fill="#0f172a"
                          fontSize="9.5"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {formatNum(val)}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}

          {/* 2. RENDER LINES (For LINE or COMBO charts) */}
          {datasets
            .filter((d) => d.type === "line" || type === "LINE")
            .map((dataset, dIdx) => {
              const isRightSide = dataset.yAxisSide === "right" && hasRightAxis;
              const maxForThis = isRightSide ? rightMax : leftMax;
              const lineColor = dataset.color || (isRightSide ? "#dc2626" : defaultColors[(leftDatasets.length + dIdx) % defaultColors.length]);

              const points = dataset.data.map((val, cIdx) => {
                const x = padding.left + cIdx * categoryWidth + categoryWidth / 2;
                const y = padding.top + plotHeight - (val / maxForThis) * plotHeight;
                return { x, y, val };
              });

              const pathData = points
                .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x},${pt.y}`)
                .join(" ");

              return (
                <g key={dIdx}>
                  {/* Line path */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Points and value tags */}
                  {points.map((pt, pIdx) => (
                    <g key={pIdx}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4.5"
                        fill="#ffffff"
                        stroke={lineColor}
                        strokeWidth="2.5"
                      />
                      <rect
                        x={pt.x - 16}
                        y={pt.y - 20}
                        width="32"
                        height="14"
                        fill="#ffffff"
                        rx="3"
                        stroke="#e2e8f0"
                        strokeWidth="0.5"
                        className="opacity-90"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        fill={lineColor}
                        fontSize="9.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {formatNum(pt.val)}
                      </text>
                    </g>
                  ))}
                </g>
              );
            })}
        </svg>
      </div>

      {/* Legend Chú giải */}
      <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
        <span className="font-bold text-slate-700">Chú giải:</span>
        {datasets.map((dataset, dIdx) => {
          const isLine = dataset.type === "line" || type === "LINE";
          const color =
            dataset.color ||
            (dataset.yAxisSide === "right"
              ? "#dc2626"
              : defaultColors[dIdx % defaultColors.length]);

          return (
            <div key={dIdx} className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              {isLine ? (
                <div className="flex items-center gap-0.5">
                  <span className="w-3 h-0.5" style={{ backgroundColor: color }} />
                  <span className="w-2 h-2 rounded-full border border-white" style={{ backgroundColor: color }} />
                  <span className="w-3 h-0.5" style={{ backgroundColor: color }} />
                </div>
              ) : (
                <span className="w-3.5 h-3.5 rounded-xs" style={{ backgroundColor: color }} />
              )}
              <span className="text-slate-800 font-medium">
                {dataset.label} {dataset.unit ? `(${dataset.unit})` : ""}
              </span>
            </div>
          );
        })}
      </div>

      {source && (
        <p className="text-right text-[11px] text-slate-400 font-medium italic mt-2">
          ({source})
        </p>
      )}
    </div>
  );
};
