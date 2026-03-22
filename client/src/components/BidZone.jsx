import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../utils/socket.js';
import { useGameStore } from '../store/gameStore.js';
import { fmtLakhs, incr } from '../utils/helpers.js';
import TimerRing from './TimerRing.jsx';

export default function BidZone({ roomCode }) {
  const { currentBid, leadingTeam, bidHistory, timerVal, teams, playerTeamIdx, youPassed, lastResult } = useGameStore();

  const myTeam = teams[playerTeamIdx];
  const leadingName = leadingTeam !== null ? teams[leadingTeam]?.name : null;
  const step = incr(currentBid);
  const nextBid = currentBid + step;
  const canBid = !youPassed && leadingTeam !== playerTeamIdx && myTeam?.purse >= nextBid && !lastResult;

  function bid() {
    if (!canBid) return;
    socket.emit('auction:bid', { code: roomCode, amount: nextBid }, (res) => {
      if (res?.error) console.warn(res.error);
    });
  }

  function pass() { socket.emit('auction:pass', { code: roomCode }); }
  function skipPlayer() { socket.emit('auction:next', { code: roomCode }); }

  if (lastResult) return null;

  return (
    <div className="card rounded-xl p-4">
      {/* Current bid + timer */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[3px] text-[#9AA3B8] font-condensed mb-1">Current Bid</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBid}
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-bebas text-5xl tracking-wider text-gold leading-none"
            >
              {fmtLakhs(currentBid)}
            </motion.div>
          </AnimatePresence>
          <div className="text-xs text-[#9AA3B8] mt-1.5 font-condensed">
            Leading: <span className="font-bold text-white">{leadingName || '— Bidding Open'}</span>
          </div>
        </div>
        <TimerRing val={timerVal} />
      </div>

      {/* Increment rule */}
      <div className="bg-s3 rounded-lg px-3 py-2 mb-4 text-xs text-[#5A6478] font-condensed">
        Each bid raises by <span className="text-gold font-bold">{fmtLakhs(step)}</span>
        &nbsp;·&nbsp; Increment becomes <span className="text-gold font-bold">₹25L</span> once bid crosses ₹5 Cr
      </div>

      {/* Single raise bid button */}
      <button
        disabled={!canBid}
        onClick={bid}
        className="btn-gold w-full py-4 font-bebas text-2xl tracking-[3px] mb-3 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        BID {fmtLakhs(nextBid)}
      </button>

      {/* Pass + Skip */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={pass}
          disabled={youPassed || !!lastResult}
          className="btn-ghost py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {youPassed ? '✗ Passed' : 'Pass'}
        </button>
        <button onClick={skipPlayer} className="btn-ghost py-2.5 text-sm">
          Skip Player
        </button>
      </div>

      {/* Bid log */}
      <div className="bg-s3 rounded-lg p-3 max-h-32 overflow-y-auto space-y-1">
        <div className="text-[10px] uppercase tracking-widest text-[#5A6478] font-condensed mb-1">Bid History</div>
        {bidHistory.map((b, i) => (
          <div key={i} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
            <span className={`text-xs font-condensed ${b.teamIdx === playerTeamIdx ? 'text-info font-bold' : b.isBase ? 'text-[#5A6478]' : 'text-[#9AA3B8]'}`}>
              {b.teamIdx === playerTeamIdx ? 'You' : b.team}
            </span>
            <span className="text-xs font-condensed font-bold text-[#E8EAF2]">{fmtLakhs(b.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
