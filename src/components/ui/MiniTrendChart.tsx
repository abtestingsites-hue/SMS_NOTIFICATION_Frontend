import React from 'react';

interface MiniTrendChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  fillOpacity?: number;
}

export const MiniTrendChart: React.FC<MiniTrendChartProps> = ({
  data,
  color = '#5269D9',
  width = 64,
  height = 24,
  strokeWidth = 1.5,
  fillOpacity = 0.15
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const polylinePoints = points.join(' ');
  const areaPoints = `0,${height} ${polylinePoints} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylinePoints}
      />
    </svg>
  );
};

