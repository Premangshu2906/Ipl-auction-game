import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { roleFull, getInitials, fmtLakhs, fakeStats, ROLE_COLORS, ROLE_TEXT } from '../utils/helpers.js';

export default function PlayerCard({ player, lot, poolLength }) {
  const stats = useMemo(() => player ? fakeStats(player) : [], [player?.id]);
  if (!player) return null;
  const initials = getInitials(player.name);
  const isCapped = player.cap === 'C';

  return (
    <motion.div
      key={player.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-s3 px-4 py-2.5 flex justify-between items-center border-b border-[rgba(245,166,35,0.2)]">
        <span className="font-condensed text-[11px] font-bold tracking-[2px] uppercase text-gold">
          {roleFull(player.role)} · {isCapped ? 'Capped' : 'Uncapped'}
        </span>
        <span className="font-bebas text-sm text-[#5A6478] tracking-widest">LOT {lot} / {poolLength}</span>
      </div>

      {/* Body */}
      <div className="p-4 flex gap-4 items-start">
        {/* Avatar */}
        <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center flex-shrink-0 ${ROLE_COLORS[player.role]}`}>
          <span className={`font-bebas text-2xl tracking-wider ${ROLE_TEXT[player.role]}`}>{initials}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="badge-role">{player.role}</span>
            <span className={isCapped ? 'badge-capped' : 'badge-uncapped'}>
              {isCapped ? 'CAPPED' : 'UNCAPPED'}
            </span>
          </div>
          <h3 className="font-bebas text-3xl tracking-widest text-white leading-none truncate">{player.name}</h3>
          <p className="text-xs text-[#9AA3B8] mt-1">{player.country}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] uppercase tracking-widest text-[#5A6478] font-condensed">Base:</span>
            <span className="font-condensed font-bold text-gold text-sm">{fmtLakhs(player.base)}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 border-t border-[rgba(245,166,35,0.2)]">
        {stats.map((s, i) => (
          <div key={i} className={`py-2.5 text-center ${i < 3 ? 'border-r border-[rgba(245,166,35,0.12)]' : ''}`}>
            <div className="font-condensed font-bold text-base text-[#E8EAF2]">{s.val}</div>
            <div className="text-[9px] uppercase tracking-widest text-[#5A6478] font-condensed mt-0.5">{s.lbl}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
