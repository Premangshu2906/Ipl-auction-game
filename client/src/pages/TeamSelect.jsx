import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { socket } from '../utils/socket.js';
import { useGameStore } from '../store/gameStore.js';
import { TEAMS, TeamLogo } from '../utils/teams.jsx';

export default function TeamSelect() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mode = params.get('mode');
  const joinCode = params.get('code');
  const [selected, setSelected] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const store = useGameStore();

  async function handleStart() {
    if (selected === null) { setError('Pick a team first.'); return; }
    setLoading(true);
    setError('');
    if (!socket.connected) socket.connect();

    if (mode === 'solo') {
      socket.emit('solo:start', { teamIdx: selected }, (res) => {
        if (res.error) { setError(res.error); setLoading(false); return; }
        store.setRoom({ roomCode: res.code, playerTeamIdx: selected, isHost: true, isSolo: true, teams: res.room.teams, players: res.room.players, poolLength: res.room.poolLength });
        navigate(`/auction/${res.code}`);
      });
    } else if (mode === 'multi') {
      socket.emit('room:create', { teamIdx: selected, playerName: playerName || 'Host' }, (res) => {
        if (res.error) { setError(res.error); setLoading(false); return; }
        store.setRoom({ roomCode: res.code, playerTeamIdx: selected, isHost: true, isSolo: false, teams: res.room.teams, players: res.room.players });
        navigate(`/lobby/${res.code}`);
      });
    } else if (mode === 'join') {
      socket.emit('room:join', { code: joinCode, teamIdx: selected, playerName: playerName || 'Player' }, (res) => {
        if (res.error) { setError(res.error); setLoading(false); return; }
        store.setRoom({ roomCode: joinCode, playerTeamIdx: selected, isHost: false, isSolo: false, teams: res.room.teams, players: res.room.players });
        navigate(`/lobby/${joinCode}`);
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div className="w-full max-w-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate('/')} className="text-[#5A6478] text-sm font-condensed mb-6 hover:text-white transition-colors">← Back</button>
        <h2 className="font-bebas text-5xl tracking-[4px] text-gold mb-1">Pick Your Team</h2>
        <p className="text-[#5A6478] text-sm mb-6">
          {mode === 'solo' ? 'You vs 4 AI teams · ₹120 Cr purse · 15 player slots' : 'Choose your team for the auction room'}
        </p>

        {mode !== 'solo' && (
          <div className="card rounded-xl p-4 mb-5">
            <div className="text-[10px] uppercase tracking-[3px] text-[#5A6478] font-condensed mb-2">Your Name</div>
            <input
              className="w-full bg-s3 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder:text-[#5A6478] outline-none focus:border-[rgba(245,166,35,0.6)] transition-colors"
              placeholder="Enter your name..."
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              maxLength={20}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 mb-6">
          {TEAMS.map((t) => (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => { setSelected(t.id); setError(''); }}
              className={`w-full text-left rounded-xl p-4 border-2 transition-all ${selected === t.id ? 'border-gold bg-s3' : 'border-[rgba(245,166,35,0.2)] bg-s2 hover:border-[rgba(245,166,35,0.4)]'}`}
            >
              <div className="flex items-center gap-3">
                <TeamLogo teamId={t.id} size={44} />
                <div>
                  <div className="font-condensed font-bold text-base text-white">{t.name}</div>
                  <div className="text-xs text-[#5A6478]">₹120 Cr purse · 15 player slots</div>
                </div>
                {selected === t.id && (
                  <div className="ml-auto w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                    <span className="text-black text-xs font-bold">✓</span>
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {error && <p className="text-danger text-sm font-condensed mb-4">{error}</p>}

        <button
          onClick={handleStart}
          disabled={selected === null || loading}
          className="btn-gold w-full py-4 text-xl font-bebas tracking-[3px] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? 'Connecting...' : mode === 'solo' ? 'Start Auction →' : mode === 'multi' ? 'Create Room →' : 'Join Room →'}
        </button>
      </motion.div>
    </div>
  );
}
