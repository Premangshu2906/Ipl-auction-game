import React from 'react';
import { useGameStore } from '../store/gameStore.js';
import { fmtLakhs } from '../utils/helpers.js';

export default function SquadMini() {
  const { teams, playerTeamIdx } = useGameStore();
  const myTeam = teams[playerTeamIdx];
  if (!myTeam) return null;

  const squad = myTeam.squad;
  const need = 15 - squad.length;
  const recent = [...squad].reverse().slice(0, 9);

  return (
    <div>
      <div className="bg-s2 border border-[rgba(245,166,35,0.2)] rounded-xl p-3">
        {recent.length === 0 ? (
          <div className="text-xs text-[#5A6478] font-condensed text-center py-2">No players yet</div>
        ) : (
          <div className="space-y-1">
            {recent.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-white/4 last:border-0">
                <div>
                  <span className="text-[11px] text-white font-condensed">{p.name.split(' ').slice(-1)[0]}</span>
                  <span className="text-[9px] text-[#5A6478] ml-1.5">{p.role}</span>
                </div>
                <span className="text-[11px] text-gold font-condensed font-bold">{fmtLakhs(p.soldPrice)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="text-[11px] text-[#9AA3B8] font-condensed mt-2">
        {squad.length}/15 filled · <span className="text-gold">{need} slot{need !== 1 ? 's' : ''} needed</span>
      </div>
    </div>
  );
}
