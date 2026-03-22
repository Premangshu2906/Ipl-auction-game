import { startNextPlayer } from '../index.js';

function incr(bid) { return bid < 500 ? 20 : 25; }

export function setupAuctionHandlers(socket, io, getRoom, sanitizeRoom, startNext) {
  socket.on('auction:bid', ({ code, amount }, callback) => {
    const room = getRoom(code);
    if (!room || !room.auctionActive) return callback?.({ error: 'No active auction' });

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) return callback?.({ error: 'Not in room' });

    const team = room.teams[player.teamIdx];
    const expected = room.currentBid + incr(room.currentBid);

    if (amount < expected) return callback?.({ error: 'Bid too low' });
    if (amount > team.purse) return callback?.({ error: 'Insufficient purse' });
    if (team.passed) return callback?.({ error: 'You already passed' });
    if (room.leadingTeam === player.teamIdx) return callback?.({ error: 'You are already leading' });

    room.currentBid = amount;
    room.leadingTeam = player.teamIdx;
    room.timerVal = 15;
    room.bidHistory.unshift({ team: team.name, amount, teamIdx: player.teamIdx, isYou: false });

    io.to(code).emit('auction:bid', {
      amount,
      teamIdx: player.teamIdx,
      bidHistory: room.bidHistory,
    });
    callback?.({ success: true });
  });

  socket.on('auction:pass', ({ code }, callback) => {
    const room = getRoom(code);
    if (!room || !room.auctionActive) return;
    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) return;
    room.teams[player.teamIdx].passed = true;
    socket.emit('auction:youPassed');
    callback?.({ success: true });
  });

  socket.on('auction:next', ({ code }, callback) => {
    const room = getRoom(code);
    if (!room) return;
    const player = room.players.find(p => p.socketId === socket.id);
    if (!player?.isHost) return callback?.({ error: 'Only host can skip' });

    clearInterval(room.timerInterval);
    clearTimeout(room.aiTimeout);
    room.playerIdx++;
    startNextPlayer(room, io);
    callback?.({ success: true });
  });
}
