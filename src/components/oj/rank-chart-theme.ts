export const rankChartColors = {
  grid: "rgba(255,255,255,0.06)",
  axis: "rgba(255,255,255,0.45)",
  pink: "#e89ab8",
  pinkSoft: "rgba(232,168,184,0.75)",
  blue: "#8eb4ff",
  blueSoft: "rgba(142,180,255,0.75)",
  green: "#5dcea0",
  tooltipBg: "rgba(22,18,28,0.96)",
  tooltipBorder: "rgba(255,255,255,0.12)",
  tooltipText: "#f5f0f4",
  series: [
    "#e89ab8",
    "#8eb4ff",
    "#5dcea0",
    "#e8b86d",
    "#c4a0ff",
    "#f07178",
    "#7dd3c0",
    "#f0c674",
    "#81a1c1",
    "#d08770",
  ],
};

export const rankTooltipStyle = {
  background: rankChartColors.tooltipBg,
  border: `1px solid ${rankChartColors.tooltipBorder}`,
  borderRadius: 12,
  color: rankChartColors.tooltipText,
  fontSize: 12,
  boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
};
