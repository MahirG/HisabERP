"use client";

import { useId, useState } from "react";

type TrendPoint = { period: string; value: number };

/** Small public sample charts do not need the workspace charting runtime. */
export function MarketingTrendChart({ data, label, color = "#315efb", formatValue = String }: {
  data: readonly TrendPoint[];
  label: string;
  color?: string;
  formatValue?: (value: number) => string;
}) {
  const id = useId();
  const [active, setActive] = useState<number | null>(null);
  const maximum = Math.max(1, ...data.map((point) => point.value));
  const ceiling = Math.ceil(maximum / 4) * 4;
  const x = (index: number) => 52 + index * (408 / Math.max(1, data.length - 1));
  const y = (value: number) => 158 - value / ceiling * 134;
  const line = data.map((point, index) => `${index ? "L" : "M"}${x(index)},${y(point.value)}`).join(" ");

  return (
    <div className="marketing-trend-chart" onPointerLeave={() => setActive(null)}>
      <svg viewBox="0 0 480 190" width="100%" height="100%" role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>{label}</title>
        <desc id={`${id}-description`}>{data.map((point) => `${point.period}: ${formatValue(point.value)}`).join("; ")}. Illustrative sample data.</desc>
        {[0, 1, 2, 3, 4].map((step) => <g key={step} aria-hidden="true">
          <line x1="52" x2="460" y1={y(ceiling * step / 4)} y2={y(ceiling * step / 4)} stroke="#e7ebf0" />
          <text x="44" y={y(ceiling * step / 4) + 3} textAnchor="end" fill="#667085" fontSize="10">{formatValue(ceiling * step / 4)}</text>
        </g>)}
        <path d={`${line} L460,158 L52,158 Z`} fill={color} fillOpacity=".08" />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {data.map((point, index) => <g key={point.period}>
          <text x={x(index)} y="180" textAnchor="middle" fill="#667085" fontSize="10" aria-hidden="true">{point.period}</text>
          <circle cx={x(index)} cy={y(point.value)} r={active === index ? 5 : 3} fill={color} aria-hidden="true" />
          <circle cx={x(index)} cy={y(point.value)} r="16" fill="transparent" tabIndex={0}
            role="img" aria-label={`${point.period}: ${formatValue(point.value)}`}
            onPointerEnter={() => setActive(index)} onFocus={() => setActive(index)} onBlur={() => setActive(null)}>
            <title>{`${point.period}: ${formatValue(point.value)}`}</title>
          </circle>
        </g>)}
      </svg>
      {active !== null && <span className="marketing-trend-tooltip" aria-hidden="true">{data[active].period} · {formatValue(data[active].value)}</span>}
    </div>
  );
}
