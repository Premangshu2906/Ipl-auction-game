import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { socket } from '../utils/socket.js';
import { useGameStore } from '../store/gameStore.js';

export default function Lobby() {
  const navigate = useNavigate();
  const reset = useGameStore(s => s.reset);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  function handleSolo() { reset(); navigate('/select?mode=solo'); }
  function handleCreate() { reset(); navigate('/select?mode=multi'); }
  function handleJoin() {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 6) { setError('Enter a valid 6-character room code.'); return; }
    reset();
    navigate(`/select?mode=join&code=${code}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: '#07090F' }}>
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">
          {/* Gavel hexagon logo */}
          <div className="relative flex items-center justify-center mb-4">
            {/* Outer hex shape */}
            <div style={{
              width: 90, height: 90,
              background: 'linear-gradient(135deg, #c27d0e, #F5A623, #c27d0e)',
              clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 40 }}>🔨</span>
            </div>
            {/* Banner */}
            <div style={{
              position: 'absolute', left: 72, top: '50%', transform: 'translateY(-50%)',
              background: 'linear-gradient(90deg, #0a1628, #1a2a4a)',
              border: '1px solid #F5A623',
              borderLeft: 'none',
              paddingLeft: 20, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
              clipPath: 'polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%)',
              minWidth: 170,
            }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3, color: '#F5A623' }}>LET'S BID</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: 3, color: '#9AA3B8', marginTop: -2 }}>IPL AUCTION</div>
            </div>
          </div>

          <p className="text-[11px] tracking-[4px] uppercase text-[#5A6478] font-condensed mt-2">2025 Edition</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[['150', 'Players'], ['5', 'Teams'], ['₹120Cr', 'Each']].map(([v, l]) => (
            <div key={l} className="card rounded-xl p-4 text-center">
              <div className="font-bebas text-3xl text-gold">{v}</div>
              <div className="text-[10px] uppercase tracking-widest text-[#5A6478] font-condensed mt-1">{l}</div>
            </div>
          ))}
        </div>

        {/* Mode buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={handleSolo} className="card rounded-xl p-5 text-center cursor-pointer hover:border-gold/50 hover:bg-s3 transition-all">
            <div className="text-3xl mb-2">🎮</div>
            <div className="font-bebas text-xl text-gold tracking-wider">Quick Play</div>
            <div className="text-[11px] text-[#5A6478] mt-1 leading-relaxed">Solo vs 4 AI teams</div>
          </button>
          <button onClick={handleCreate} className="card rounded-xl p-5 text-center cursor-pointer hover:border-gold/50 hover:bg-s3 transition-all">
            <div className="text-3xl mb-2">👥</div>
            <div className="font-bebas text-xl text-gold tracking-wider">Multiplayer</div>
            <div className="text-[11px] text-[#5A6478] mt-1 leading-relaxed">Create room with friends</div>
          </button>
        </div>

        {/* Join room */}
        <div className="card rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-[3px] text-[#5A6478] font-condensed mb-3">Join a Room</div>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-s3 border border-white/10 rounded-lg px-3 py-2.5 text-white font-condensed text-lg tracking-[3px] uppercase placeholder:text-[#5A6478] outline-none focus:border-[rgba(245,166,35,0.6)] transition-colors"
              placeholder="IPLXXX"
              maxLength={6}
              value={joinCode}
              onChange={e => { setJoinCode(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
            <button onClick={handleJoin} className="btn-gold px-5 py-2.5 text-sm">Join</button>
          </div>
          {error && <p className="text-danger text-xs mt-2 font-condensed">{error}</p>}
        </div>
      </motion.div>
    </div>
  );
}
