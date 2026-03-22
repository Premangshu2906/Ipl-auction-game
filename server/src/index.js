import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PLAYER_POOL, TEAMS_DEF } from './data/players.js';
import { createRoom, getRoom, deleteRoom } from './store/rooms.js';
import { setupAuctionHandlers } from './handlers/auction.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/rooms/:code', (req, res) => {
  const room = getRoom(req.params.code);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ exists: true, playerCount: room.players.length, started: room.started });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('room:create', ({ teamIdx, playerName }, callback) => {
    const code = generateCode();
    const room = createRoom(code, TEAMS_DEF, PLAYER_POOL);
    room.players.push({ socketId: socket.id, name: playerName || 'Player 1', teamIdx, isHost: true });
    socket.join(code);
    callback({ code, room: sanitizeRoom(room) });
  });

  socket.on('room:join', ({ code, teamIdx, playerName }, callback) => {
    const room = getRoom(code);
    if (!room) return callback({ error: 'Room not found' });
    if (room.started) return callback({ error: 'Auction already started' });
    if (room.players.length >= 5) return callback({ error: 'Room is full' });
    const taken = room.players.map((p) => p.teamIdx);
    if (taken.includes(teamIdx)) return callback({ error: 'Team already taken' });
    room.players.push({ socketId: socket.id, name: playerName || `Player ${room.players.length + 1}`, teamIdx, isHost: false });
    socket.join(code);
    io.to(code).emit('room:updated', sanitizeRoom(room));
    callback({ success: true, room: sanitizeRoom(room) });
  });

  socket.on('room:start', ({ code }, callback) => {
    const room = getRoom(code);
    if (!room) return callback({ error: 'Room not found' });
    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player?.isHost) return callback({ error: 'Only host can start' });
    room.started = true;
    fillAITeams(room);
    startNextPlayer(room, io);
    io.to(code).emit('auction:started', sanitizeRoom(room));
    callback({ success: true });
  });

  socket.on('solo:start', ({ teamIdx }, callback) => {
    const fakeCode = 'SOLO_' + socket.id;
    const room = createRoom(fakeCode, TEAMS_DEF, PLAYER_POOL);
    room.players.push({ socketId: socket.id, name: 'You', teamIdx, isHost: true });
    room.started = true;
    fillAITeams(room);
    socket.join(fakeCode);
    startNextPlayer(room, io);
    callback({ code: fakeCode, room: sanitizeRoom(room) });
  });

  setupAuctionHandlers(socket, io, getRoom, sanitizeRoom, startNextPlayer);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'IPL';
  for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function fillAITeams(room) {
  const takenIdx = room.players.map((p) => p.teamIdx);
  const personalities = ['aggressive', 'smart', 'balanced', 'random', 'conservative'];
  TEAMS_DEF.forEach((t, i) => {
    if (!takenIdx.includes(i)) {
      room.players.push({ socketId: null, name: t.name + ' (AI)', teamIdx: i, isHost: false, isAI: true });
      room.teams[i].aiPersonality = personalities[i % personalities.length];
    }
  });
}

// Players come in order: BAT → BWL → AR → WK, capped first then uncapped within each
function orderedPool(pool) {
  const ORDER = ['BAT', 'BWL', 'AR', 'WK'];
  const result = [];
  for (const role of ORDER) {
    const capped = pool.filter(p => p.role === role && p.cap === 'C').sort(() => Math.random() - 0.5);
    const uncapped = pool.filter(p => p.role === role && p.cap === 'U').sort(() => Math.random() - 0.5);
    result.push(...capped, ...uncapped);
  }
  return result;
}

function getCategoryName(role, cap) {
  const roleMap = { BAT: 'Batsmen', BWL: 'Bowlers', AR: 'All-Rounders', WK: 'Wicketkeepers' };
  return (cap === 'C' ? 'Capped ' : 'Uncapped ') + roleMap[role];
}

export function startNextPlayer(room, io) {
  if (room.playerIdx >= room.pool.length) { endAuction(room, io); return; }

  const p = room.pool[room.playerIdx];
  const prevPlayer = room.playerIdx > 0 ? room.pool[room.playerIdx - 1] : null;
  const categoryChanged = !prevPlayer || prevPlayer.role !== p.role || prevPlayer.cap !== p.cap;

  if (categoryChanged) {
    const catLabel = getCategoryName(p.role, p.cap);
    io.to(room.code).emit('auction:category', { role: p.role, cap: p.cap, label: catLabel });
    setTimeout(() => launchPlayer(room, io, p), 3000);
    return;
  }

  launchPlayer(room, io, p);
}

function launchPlayer(room, io, p) {
  room.currentPlayer = p;
  room.currentBid = p.base;
  room.leadingTeam = null;
  room.timerVal = 15;
  room.bidHistory = [{ team: 'Base price', amount: p.base, isBase: true }];
  room.teams.forEach((t) => (t.passed = false));
  room.auctionActive = true;

  io.to(room.code).emit('auction:player', {
    player: p,
    lot: room.playerIdx + 1,
    currentBid: p.base,
    bidHistory: room.bidHistory,
    poolLength: room.pool.length,
  });

  clearInterval(room.timerInterval);
  room.timerInterval = setInterval(() => {
    room.timerVal--;
    io.to(room.code).emit('auction:tick', { val: room.timerVal });
    if (room.timerVal <= 0) { clearInterval(room.timerInterval); hammer(room, io); }
  }, 1000);

  scheduleAI(room, io);
}

function hammer(room, io) {
  clearInterval(room.timerInterval);
  clearTimeout(room.aiTimeout);
  room.auctionActive = false;

  if (room.leadingTeam === null) {
    room.unsoldCount++;
    io.to(room.code).emit('auction:unsold', { player: room.currentPlayer });
  } else {
    room.soldCount++;
    const team = room.teams[room.leadingTeam];
    team.purse -= room.currentBid;
    team.squad.push({ ...room.currentPlayer, soldPrice: room.currentBid });
    io.to(room.code).emit('auction:sold', {
      player: room.currentPlayer, teamIdx: room.leadingTeam, price: room.currentBid, teams: room.teams,
    });
  }
  io.to(room.code).emit('auction:stats', {
    soldCount: room.soldCount, unsoldCount: room.unsoldCount, poolLeft: room.pool.length - room.playerIdx - 1,
  });
}

function scheduleAI(room, io) {
  clearTimeout(room.aiTimeout);
  if (!room.auctionActive) return;
  const delay = 1800 + Math.random() * 2500;
  room.aiTimeout = setTimeout(() => aiTurn(room, io), delay);
}

function slotsNeeded(team) {
  const counts = { BAT: 0, BWL: 0, AR: 0, WK: 0 };
  team.squad.forEach(p => counts[p.role]++);
  return {
    BAT: Math.max(0, 4 - counts.BAT),
    BWL: Math.max(0, 4 - counts.BWL),
    AR: Math.max(0, 2 - counts.AR),
    WK: Math.max(0, 1 - counts.WK),
    total: Math.max(0, 15 - team.squad.length),
  };
}

function maxBudgetForPlayer(team, player) {
  const needed = slotsNeeded(team);
  const slotsLeft = needed.total;
  if (slotsLeft <= 0) return 0;

  // Reserve minimum ₹20L per remaining slot
  const minReserve = (slotsLeft - 1) * 20;
  const available = team.purse - minReserve;
  if (available <= 0) return 0;

  // Realistic caps per player tier
  let maxMultiplier;
  if (player.base >= 200) maxMultiplier = 5.5;    // max ~₹11 Cr
  else if (player.base >= 100) maxMultiplier = 4; // max ~₹4 Cr
  else if (player.base >= 50) maxMultiplier = 3.5;// max ~₹1.75 Cr
  else maxMultiplier = 3;                          // max ₹60L

  const capByTier = player.base * maxMultiplier;
  const hardCap = 1200; // Never more than ₹12 Cr
  const purseCapPct = Math.round(12000 * 0.18); // 18% of starting purse

  return Math.min(available, capByTier, hardCap, purseCapPct);
}

function aiTurn(room, io) {
  if (!room.auctionActive) return;

  const player = room.currentPlayer;
  const nextBid = room.currentBid + incr(room.currentBid);

  const eligibleAI = room.players.filter(p =>
    p.isAI &&
    p.teamIdx !== room.leadingTeam &&
    !room.teams[p.teamIdx].passed &&
    room.teams[p.teamIdx].squad.length < 15
  );

  if (!eligibleAI.length) { scheduleAI(room, io); return; }

  // Shuffle to prevent one team always going first
  const shuffled = [...eligibleAI].sort(() => Math.random() - 0.5);

  for (const aiPlayer of shuffled) {
    const team = room.teams[aiPlayer.teamIdx];
    const needed = slotsNeeded(team);
    const maxCanPay = maxBudgetForPlayer(team, player);

    if (nextBid > team.purse || nextBid > maxCanPay) { team.passed = true; continue; }

    const roleNeeded = needed[player.role] > 0;
    const personality = team.aiPersonality || 'balanced';
    const bidRatio = room.currentBid / Math.max(player.base, 1);

    // Base interest by tier
    let interest;
    if (player.base >= 200) interest = 0.82;
    else if (player.base >= 100) interest = 0.68;
    else if (player.base >= 50) interest = 0.52;
    else interest = 0.40;

    // Role need boost
    if (roleNeeded) interest += 0.22;
    else interest -= 0.18; // not needed — less interested

    // Personality
    if (personality === 'aggressive') interest += 0.15;
    else if (personality === 'smart') interest += roleNeeded ? 0.12 : -0.18;
    else if (personality === 'conservative') interest -= 0.12;
    else if (personality === 'random') interest += (Math.random() - 0.5) * 0.30;

    // Price dropoff
    if (bidRatio > 7) interest -= 0.60;
    else if (bidRatio > 5) interest -= 0.40;
    else if (bidRatio > 3.5) interest -= 0.22;
    else if (bidRatio > 2) interest -= 0.10;

    // Purse pressure
    if (team.purse < 2000) interest -= 0.15;
    if (team.purse < 1000) interest -= 0.30;
    if (team.purse < 500) interest -= 0.50;

    // At base price always ensure minimum participation
    if (room.currentBid <= player.base && room.leadingTeam === null) {
      interest = Math.max(interest, 0.60);
    }

    interest = Math.max(0, Math.min(0.94, interest));

    if (Math.random() < interest) {
      room.currentBid = nextBid;
      room.leadingTeam = aiPlayer.teamIdx;
      room.timerVal = 15;
      room.bidHistory.unshift({ team: team.name, amount: nextBid, teamIdx: aiPlayer.teamIdx });
      io.to(room.code).emit('auction:bid', {
        amount: nextBid, teamIdx: aiPlayer.teamIdx, bidHistory: room.bidHistory,
      });
      break;
    } else {
      if (interest < 0.10) team.passed = true;
    }
  }

  scheduleAI(room, io);
}

function endAuction(room, io) {
  io.to(room.code).emit('auction:ended', { teams: room.teams });
  setTimeout(() => deleteRoom(room.code), 60000 * 30);
}

function sanitizeRoom(room) {
  return {
    code: room.code, players: room.players, teams: room.teams, started: room.started,
    playerIdx: room.playerIdx, soldCount: room.soldCount, unsoldCount: room.unsoldCount, poolLength: room.pool.length,
  };
}

function incr(bid) { return bid < 500 ? 20 : 25; }

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
