import React from 'react';

export default function TimerRing({ val, max = 15, size = 64 }) {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - val / max);
  const color = val <= 4 ? '#E24B4A' : val <= 8 ? '#EF9F27' : '#F5A623';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(245,166,35,0.12)" strokeWidth="3" />
          <circle
            cx={size/2} cy={size/2} r={r}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-bebas text-2xl" style={{ color }}>
          {Math.max(0, val)}
        </div>
      </div>
      <div className="text-[9px] uppercase tracking-widest text-[#5A6478] font-condensed">secs</div>
    </div>
  );
}
