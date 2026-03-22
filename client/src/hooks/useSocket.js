import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../utils/socket.js';
import { useGameStore } from '../store/gameStore.js';

export function useSocket() {
  const navigate = useNavigate();
  const store = useGameStore();

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on('room:updated', (room) => {
      store.setRoom({ teams: room.teams, players: room.players });
    });

    socket.on('auction:started', (room) => {
      store.setRoom({ teams: room.teams, players: room.players, poolLength: room.poolLength });
    });

    socket.on('auction:category', ({ role, cap, label }) => {
      store.setCategory({ role, cap, label });
    });

    socket.on('auction:player', ({ player, lot, currentBid, bidHistory, poolLength }) => {
      store.setCurrentPlayer(player, lot);
      store.setCurrentBid(currentBid, null, bidHistory);
      store.setTimer(15);
      store.clearCategory();
      if (poolLength !== undefined) store.setRoom({ poolLength });
    });

    socket.on('auction:bid', ({ amount, teamIdx, bidHistory }) => {
      store.setCurrentBid(amount, teamIdx, bidHistory);
    });

    socket.on('auction:tick', ({ val }) => {
      store.setTimer(val);
    });

    socket.on('auction:sold', ({ player, teamIdx, price, teams }) => {
      store.setSold({ type: 'sold', player, teamIdx, price });
      store.setTeams(teams);
    });

    socket.on('auction:unsold', ({ player }) => {
      store.setUnsold({ type: 'unsold', player });
    });

    socket.on('auction:stats', (stats) => {
      store.setStats(stats);
    });

    socket.on('auction:youPassed', () => {
      store.setYouPassed();
    });

    socket.on('auction:ended', ({ teams }) => {
      store.setAuctionEnded(teams);
      navigate('/results');
    });

    return () => {
      socket.off('room:updated');
      socket.off('auction:started');
      socket.off('auction:category');
      socket.off('auction:player');
      socket.off('auction:bid');
      socket.off('auction:tick');
      socket.off('auction:sold');
      socket.off('auction:unsold');
      socket.off('auction:stats');
      socket.off('auction:youPassed');
      socket.off('auction:ended');
    };
  }, []);
}
