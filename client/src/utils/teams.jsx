import React from 'react';

export const TEAMS = [
  { id: 0, name: 'Mumbai Indians', short: 'MI', color: '#1D4ED8', darkBg: '#1e3a8a' },
  { id: 1, name: 'Chennai Super Kings', short: 'CSK', color: '#EAB308', darkBg: '#713f12' },
  { id: 2, name: 'Royal Challengers', short: 'RCB', color: '#DC2626', darkBg: '#7f1d1d' },
  { id: 3, name: 'Kolkata Knight Riders', short: 'KKR', color: '#7C3AED', darkBg: '#3b0764' },
  { id: 4, name: 'Delhi Capitals', short: 'DC', color: '#2563EB', darkBg: '#172554' },
];

export function TeamLogo({ teamId, size = 40 }) {
  const configs = {
    0: { bg: '#0d2461', border: '#3b82f6', text: '#93c5fd', label: 'MI' },
    1: { bg: '#5c3300', border: '#EAB308', text: '#fde68a', label: 'CSK' },
    2: { bg: '#1a0000', border: '#DC2626', text: '#fca5a5', label: 'RCB' },
    3: { bg: '#1e0050', border: '#7C3AED', text: '#c4b5fd', label: 'KKR' },
    4: { bg: '#0c1f54', border: '#2563EB', text: '#93c5fd', label: 'DC' },
  };
  const c = configs[teamId];
  if (!c) return null;
  const fs = size < 36 ? 11 : size < 50 ? 13 : 15;

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <circle cx="20" cy="20" r="19" fill={c.bg} stroke={c.border} strokeWidth="2"/>
      <text x="20" y="25" textAnchor="middle" fill={c.text} fontSize={fs} fontWeight="bold" fontFamily="'Barlow Condensed', Arial, sans-serif">
        {c.label}
      </text>
    </svg>
  );
}
