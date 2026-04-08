import React from "react";
import { View, Text, Dimensions } from "react-native";
import Svg, { Line, Circle, Polyline, Text as SvgText } from "react-native-svg";

// --- Category config for grade trend line chart ---
const CATEGORY_COLORS = {
  written_works: { stroke: "#3b82f6", label: "Written Works" },
  performance_task: { stroke: "#f59e0b", label: "Performance Task" },
  quarterly_exam: { stroke: "#ec4899", label: "Quarterly Exam" },
};

const CATEGORY_KEYWORDS = {
  written_works: ["written", "written works", "written_works", "written-work"],
  performance_task: [
    "performance",
    "performance task",
    "performance_task",
    "performance-t",
  ],
  quarterly_exam: ["quarterly exam", "quarterly_exam", "quarterly", "exam"],
};

const detectCategory = (item) => {
  const text = ((item.key || "") + " " + (item.name || "")).toLowerCase();
  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => text.includes(k))) return catId;
  }
  return "other";
};

/**
 * MiniChart - Line graph per category (Written Works, Performance Task, Quarterly Exam)
 * @param {Object} props
 * @param {Object} props.data - { subjectName, items: [{ id, name, key, score, totalScore, percentage, quarter }] }
 */
export default function MiniChart({ data = {} }) {
  const items = data?.items || [];

  if (!items || items.length === 0) {
    return (
      <View
        style={{
          height: 140,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F9FAFB",
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
          No data available
        </Text>
      </View>
    );
  }

  // Filter items with valid scores
  const validItems = items.filter(
    (item) => item.score !== null && item.totalScore > 0,
  );

  if (validItems.length === 0) {
    return (
      <View
        style={{
          height: 140,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F9FAFB",
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
          No scores recorded yet
        </Text>
      </View>
    );
  }

  // Tag each item with detected category and percentage
  const taggedItems = validItems.map((item) => ({
    ...item,
    _category: detectCategory(item),
    _pct: Math.round((item.score / item.totalScore) * 100),
  }));

  // Group by category
  const grouped = {};
  taggedItems.forEach((item) => {
    if (!grouped[item._category]) grouped[item._category] = [];
    grouped[item._category].push(item);
  });

  const activeCategories = Object.keys(grouped).filter(
    (cat) => cat !== "other",
  );
  const categoriesToPlot =
    activeCategories.length > 0 ? activeCategories : Object.keys(grouped);

  const maxLen = Math.max(
    ...categoriesToPlot.map((cat) => grouped[cat]?.length || 0),
    1,
  );

  // Chart dimensions
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 80; // account for padding + y-axis labels
  const chartHeight = 120;
  const paddingLeft = 32;
  const paddingTop = 8;
  const paddingBottom = 20;
  const paddingRight = 10;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  // Y-axis ticks
  const yTicks = [0, 25, 50, 75, 100];

  // Helper to convert data point to SVG coords
  const getX = (index, total) => {
    if (total <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (index / (total - 1)) * plotWidth;
  };
  const getY = (pct) => {
    return paddingTop + plotHeight - (pct / 100) * plotHeight;
  };

  return (
    <View>
      {/* Legend */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 6,
        }}
      >
        {categoriesToPlot.map((cat) => {
          const info = CATEGORY_COLORS[cat] || {
            label: cat,
            stroke: "#6b7280",
          };
          return (
            <View
              key={cat}
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <View
                style={{
                  width: 12,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: info.stroke,
                }}
              />
              <Text style={{ fontSize: 10, color: "#6B7280" }}>
                {info.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Chart */}
      <View
        style={{ backgroundColor: "#F9FAFB", borderRadius: 12, padding: 4 }}
      >
        <Svg width={chartWidth} height={chartHeight}>
          {/* Grid lines & Y-axis labels */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <React.Fragment key={`tick-${tick}`}>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
                <SvgText
                  x={paddingLeft - 4}
                  y={y + 3}
                  fontSize={9}
                  fill="#9CA3AF"
                  textAnchor="end"
                >
                  {tick}%
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* X-axis labels */}
          {Array.from({ length: maxLen }, (_, i) => {
            const x = getX(i, maxLen);
            return (
              <SvgText
                key={`x-${i}`}
                x={x}
                y={chartHeight - 2}
                fontSize={9}
                fill="#9CA3AF"
                textAnchor="middle"
              >
                {i + 1}
              </SvgText>
            );
          })}

          {/* Lines per category */}
          {categoriesToPlot.map((cat) => {
            const catItems = grouped[cat] || [];
            const info = CATEGORY_COLORS[cat] || { stroke: "#6b7280" };

            if (catItems.length === 0) return null;

            // Build points
            const points = catItems.map((item, i) => ({
              x: getX(i, catItems.length),
              y: getY(item._pct),
              pct: item._pct,
            }));

            const pointsStr = points.map((p) => `${p.x},${p.y}`).join(" ");

            return (
              <React.Fragment key={cat}>
                {/* Line */}
                {points.length > 1 && (
                  <Polyline
                    points={pointsStr}
                    fill="none"
                    stroke={info.stroke}
                    strokeWidth={2}
                  />
                )}
                {/* Dots */}
                {points.map((p, i) => (
                  <Circle
                    key={`${cat}-dot-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r={3}
                    fill={info.stroke}
                  />
                ))}
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}
