import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { socket } from '../utils/socket.js';
import { useGameStore } from '../store/gameStore.js';
import { useSocket } from '../hooks/useSocket.js';

export default function MpLobby() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { players, teams, isHost, playerTeamIdx } = useGameStore();
  useSocket();

  useEffect(() => {
    socket.on('auction:started', () => navigate(`/auction/${code}`));
    return () => socket.off('auction:started');
  }, [code]);

  function copyCode() {
    navigator.clipboard?.writeText(code);
  }

  function startAuction() {
    socket.emit('room:start', { code }, (res) => {
      if (res?.error) alert(res.error);
    });
  }

  const humanPlayers = players.filter(p => !p.isAI);
  const aiSlots = 5 - humanPlayers.length;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-bebas text-5xl tracking-[4px] text-gold mb-1">Room Created!</h2>
        <p className="text-[#5A6478] text-sm mb-6">Share the code with up to 4 friends</p>

        {/* Room code */}
        <div className="card rounded-xl p-5 text-center mb-4 cursor-pointer hover:border-[rgba(245,166,35,0.45)] transition-colors" onClick={copyCode}>
          <div className="text-[10px] uppercase tracking-[3px] text-[#5A6478] font-condensed mb-2">Room Code</div>
          <div className="font-bebas text-6xl tracking-[10px] text-gold">{code}</div>
          <div className="text-xs text-[#5A6478] mt-2 font-condensed">Tap to copy · Share with friends</div>
        </div>

        {/* Player list */}
        <div className="card rounded-xl p-4 mb-4">
          <div className="text-[10px] uppercase tracking-[3px] text-[#5A6478] font-condensed mb-3">
            Players Joined ({humanPlayers.length}/5)
          </div>
          <div className="space-y-2">
            {humanPlayers.map((p, i) => (
              <div key={p.socketId} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className={`w-2 h-2 rounded-full ${p.isHost ? 'bg-gold' : 'bg-success'}`} />
                <span className="text-sm text-white font-condensed font-bold">
                  {p.name}
                  {p.teamIdx === playerTeamIdx && !p.isHost ? ' (You)' : ''}
                  {p.isHost ? ' (Host)' : ''}
                </span>
                <span className="ml-auto text-[10px] text-[#5A6478]">{teams[p.teamIdx]?.short}</span>
                {p.isHost && <span className="badge bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.22)] text-gold text-[9px]">HOST</span>}
              </div>
            ))}
            {Array.from({ length: aiSlots }).map((_, i) => (
              <div key={'ai-' + i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-2 h-2 rounded-full bg-[#5A6478]" />
                <span className="text-sm text-[#5A6478] font-condensed">Waiting...</span>
                <span className="ml-auto text-[10px] text-[#5A6478]">AI will fill</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="card rounded-xl p-4 mb-5 space-y-1.5">
          {[
            ['🏏', '150 players · 5 teams · ₹120 Cr purse each'],
            ['⏱', '15 second countdown per bid round'],
            ['🤖', 'Empty slots auto-filled by AI teams'],
            ['✅', 'Must fill all 15 slots or squad is incomplete'],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-2 text-xs text-[#9AA3B8]">
              <span className="text-base">{icon}</span>
              <span className="font-condensed">{text}</span>
            </div>
          ))}
        </div>

        {isHost ? (
          <button onClick={startAuction} className="btn-gold w-full py-4 font-bebas text-2xl tracking-[3px]">
            Start Auction →
          </button>
        ) : (
          <div className="card rounded-xl p-4 text-center text-[#9AA3B8] font-condensed">
            Waiting for host to start...
          </div>
        )}

        <button onClick={() => navigate('/')} className="btn-ghost w-full py-3 mt-3 text-sm font-condensed">
          ← Leave Room
        </button>
      </motion.div>
    </div>
  );
}
