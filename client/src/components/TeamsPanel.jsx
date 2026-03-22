import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore.js';
import { fmtLakhs, pct } from '../utils/helpers.js';
import { TeamLogo } from '../utils/teams.jsx';

export default function TeamsPanel() {
  const { teams, playerTeamIdx, leadingTeam } = useGameStore();

  return (
    <div className="flex flex-col gap-2">
      {teams.map((team) => {
        const isYou = team.id === playerTeamIdx;
        const isLeading = team.id === leadingTeam;
        const purseBarPct = pct(team.purse, 12000);
        const isLow = purseBarPct < 30;

        const borderColor = isLeading
          ? '#F5A623'
          : isYou
          ? 'rgba(96,165,250,0.5)'
          : 'rgba(245,166,35,0.2)';

        return (
          <div
            key={team.id}
            style={{ border: `1px solid ${borderColor}`, transition: 'border-color 0.3s' }}
            className="rounded-xl p-2.5 bg-s2"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <TeamLogo teamId={team.id} size={28} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-condensed text-xs font-bold text-white truncate">
                    {team.short}
                    {isYou && (
                      <span
                        className="ml-1 text-white font-bold tracking-wider rounded px-1"
                        style={{ fontSize: 9, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', color: '#60A5FA' }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                  <div
                    className="font-condensed font-bold rounded"
                    style={{
                      fontSize: 9,
                      padding: '2px 6px',
                      background: isLeading ? 'rgba(245,166,35,0.12)' : 'transparent',
                      color: isLeading ? '#F5A623' : team.passed ? '#E24B4A' : '#5A6478',
                    }}
                  >
                    {isLeading ? 'LEADING' : team.passed ? 'PASSED' : 'WATCHING'}
                  </div>
                </div>
              </div>
            </div>

            <div className="font-bebas text-lg text-white leading-none">{fmtLakhs(team.purse)}</div>
            <div className="font-condensed mb-1.5" style={{ fontSize: 9, color: '#5A6478' }}>
              {team.squad.length}/15 · purse left
            </div>

            <div className="purse-bar">
              <div
                className="purse-fill"
                style={{
                  width: purseBarPct + '%',
                  background: isYou ? '#60A5FA' : isLow ? '#E24B4A' : '#F5A623',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
