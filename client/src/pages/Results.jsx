import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore.js';
import { fmtLakhs } from '../utils/helpers.js';
import { TeamLogo } from '../utils/teams.jsx';

export default function Results() {
  const navigate = useNavigate();
  const { teams, playerTeamIdx, reset } = useGameStore();

  const sorted = [...teams].sort((a, b) => b.squad.length - a.squad.length);
  const winner = sorted[0];

  function playAgain() { reset(); navigate('/'); }

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: '#07090F' }}>
      <motion.div className="max-w-3xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

        {/* Header */}
        <div className="text-center mb-8">
          <div style={{ fontSize: 48 }}>🏆</div>
          <h1 className="font-bebas text-6xl tracking-[5px] text-gold mt-2">Auction Over!</h1>
          <p className="text-[#5A6478] text-sm font-condensed mt-2">Final squads and remaining purses</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {teams.map((team, i) => {
            const isYou = team.id === playerTeamIdx;
            const isWinner = team.id === winner?.id;
            const spent = 12000 - team.purse;
            const complete = team.squad.length >= 15;

            // Group squad by role
            const byRole = { BAT: [], BWL: [], AR: [], WK: [] };
            team.squad.forEach(p => { if (byRole[p.role]) byRole[p.role].push(p); });

            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-xl p-4 border ${isWinner ? 'border-gold bg-[rgba(245,166,35,0.05)]' : 'border-[rgba(245,166,35,0.18)] bg-s2'}`}
              >
                {/* Team header */}
                <div className="flex items-center gap-3 mb-3">
                  <TeamLogo teamId={team.id} size={40} />
                  <div className="flex-1">
                    <div className="font-condensed font-bold text-base text-white">
                      {team.name} {isYou && <span className="text-info text-sm">(You)</span>}
                    </div>
                    {isWinner && (
                      <div className="text-[10px] text-gold font-condensed tracking-wider uppercase">Most Players Bought 🏆</div>
                    )}
                  </div>
                  <div className={`text-[10px] font-condensed font-bold px-2 py-1 rounded border ${
                    complete
                      ? 'bg-[rgba(74,222,128,0.1)] text-success border-[rgba(74,222,128,0.25)]'
                      : 'bg-[rgba(226,75,74,0.1)] text-danger border-[rgba(226,75,74,0.25)]'
                  }`}>
                    {complete ? '✓ Complete' : `${team.squad.length}/15`}
                  </div>
                </div>

                {/* Purse stats */}
                <div className="flex gap-4 mb-3 bg-s3 rounded-lg p-2.5">
                  <div>
                    <div className="font-bebas text-xl text-gold">{fmtLakhs(team.purse)}</div>
                    <div className="text-[10px] text-[#5A6478] font-condensed">remaining</div>
                  </div>
                  <div className="border-l border-white/10 pl-4">
                    <div className="font-bebas text-xl text-[#E8EAF2]">{fmtLakhs(spent)}</div>
                    <div className="text-[10px] text-[#5A6478] font-condensed">spent</div>
                  </div>
                  <div className="border-l border-white/10 pl-4">
                    <div className="font-bebas text-xl text-[#E8EAF2]">{team.squad.length}</div>
                    <div className="text-[10px] text-[#5A6478] font-condensed">players</div>
                  </div>
                </div>

                {/* Squad grouped by role */}
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {Object.entries(byRole).map(([role, players]) => {
                    if (!players.length) return null;
                    const roleLabels = { BAT: 'Batsmen', BWL: 'Bowlers', AR: 'All-Rounders', WK: 'Wicketkeepers' };
                    const roleColors = { BAT: 'text-amber-400', BWL: 'text-red-400', AR: 'text-green-400', WK: 'text-blue-400' };
                    return (
                      <div key={role}>
                        <div className={`text-[9px] uppercase tracking-widest font-condensed font-bold mb-1 ${roleColors[role]}`}>
                          {roleLabels[role]} ({players.length})
                        </div>
                        {players.map((p, j) => (
                          <div key={j} className="flex justify-between text-xs py-0.5 border-b border-white/4 last:border-0">
                            <span className="text-[#9AA3B8] font-condensed">{p.name}</span>
                            <span className="text-gold font-condensed font-bold">{fmtLakhs(p.soldPrice)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  {team.squad.length === 0 && (
                    <div className="text-xs text-[#5A6478] font-condensed py-2 text-center">No players bought</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <button onClick={playAgain} className="btn-gold w-full py-4 font-bebas text-2xl tracking-[4px]">
          Play Again →
        </button>
      </motion.div>
    </div>
  );
}
