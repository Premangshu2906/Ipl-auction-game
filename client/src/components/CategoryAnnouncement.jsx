import React from 'react';
import { motion } from 'framer-motion';

const ROLE_ICONS = { BAT: '🏏', BWL: '🎯', AR: '⚡', WK: '🧤' };
const ROLE_COLORS = {
  BAT: { bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.4)', text: '#F5A623' },
  BWL: { bg: 'rgba(226,75,74,0.08)', border: 'rgba(226,75,74,0.4)', text: '#E24B4A' },
  AR:  { bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.4)', text: '#4ADE80' },
  WK:  { bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.4)', text: '#60A5FA' },
};

export default function CategoryAnnouncement({ category }) {
  if (!category) return null;
  const { role, label } = category;
  const c = ROLE_COLORS[role] || ROLE_COLORS.BAT;
  const icon = ROLE_ICONS[role] || '🏏';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
      style={{ border: `1px solid ${c.border}`, background: c.bg, borderRadius: 16 }}
    >
      <div style={{ fontSize: 56 }}>{icon}</div>
      <div className="font-bebas text-[13px] tracking-[5px] uppercase mt-3" style={{ color: c.text }}>
        Now Entering
      </div>
      <div className="font-bebas text-4xl tracking-[3px] text-white mt-1">{label}</div>
      <div className="text-sm text-[#5A6478] font-condensed mt-3 tracking-wider">
        Starting in a moment...
      </div>
    </motion.div>
  );
}
