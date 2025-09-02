// src/components/dashboard/LineChart.tsx
import React, { useEffect, useRef } from "react";
import { Line } from "recharts";

// We'll use recharts for the chart. Import in page where we render.
type DataPoint = { date: string; value: number };

export default function LineChart({ data }: { data: DataPoint[] }) {
  // Because Recharts needs to be imported in the page (avoid SSR issues),
  // the Chart will be used directly in the page component.
  // This placeholder keeps typing and modularity.
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-3">Cases over time</h3>
      {/* Actual chart is rendered in the page using Recharts to allow dynamic import if needed */}
      <div className="h-56 flex items-center justify-center text-slate-400">
        Chart rendering here
      </div>
    </div>
  );
}
