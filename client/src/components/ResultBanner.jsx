import React from 'react';
import { motion } from 'framer-motion';
import { fmtLakhs } from '../utils/helpers.js';
import { useGameStore } from '../store/gameStore.js';
import { socket } from '../utils/socket.js';

export default function ResultBanner({ roomCode }) {
  const { lastResult, teams, playerTeamIdx } = useGameStore();
  if (!lastResult) return null;

  const sold = lastResult.type === 'sold';
  const winner = sold ? teams[lastResult.teamIdx] : null;
  const isYou = sold && lastResult.teamIdx === playerTeamIdx;

  function next() {
    socket.emit('auction:next', { code: roomCode });
  }

  const bgColor = sold ? 'rgba(74,222,128,0.08)' : 'rgba(226,75,74,0.08)';
  const borderColor = sold ? 'rgba(74,222,128,0.3)' : 'rgba(226,75,74,0.3)';
  const titleColor = sold ? '#4ADE80' : '#E24B4A';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 12, padding: '14px 16px' }}
    >
      <div className="font-bebas tracking-widest" style={{ fontSize: 26, color: titleColor }}>
        {sold ? 'SOLD!' : 'UNSOLD'}
      </div>
      <div className="font-condensed mt-1" style={{ fontSize: 13, color: '#9AA3B8' }}>
        {sold ? (
          <>
            <span style={{ color: '#E8EAF2', fontWeight: 600 }}>{lastResult.player.name}</span>
            {' → '}
            {isYou
              ? <span style={{ color: '#60A5FA', fontWeight: 600 }}>You ({winner?.short})</span>
              : <span style={{ color: '#E8EAF2', fontWeight: 600 }}>{winner?.name}</span>
            }
            {' for '}
            <span style={{ color: '#F5A623', fontWeight: 600 }}>{fmtLakhs(lastResult.price)}</span>
          </>
        ) : (
          <>
            <span style={{ color: '#E8EAF2', fontWeight: 600 }}>{lastResult.player.name}</span>
            {' returns to the pool'}
          </>
        )}
      </div>
      <button
        onClick={next}
        className="btn-gold mt-3 font-condensed font-bold tracking-wider"
        style={{ padding: '6px 18px', fontSize: 13 }}
      >
        Next Player →
      </button>
    </motion.div>
  );
}
