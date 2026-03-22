const rooms = new Map();

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

export function createRoom(code, teamsDef, playerPool) {
  const room = {
    code,
    players: [],
    teams: teamsDef.map(t => ({ ...t, squad: [], purse: 12000, passed: false })),
    pool: orderedPool(playerPool),
    playerIdx: 0,
    currentPlayer: null,
    currentBid: 0,
    leadingTeam: null,
    bidHistory: [],
    soldCount: 0,
    unsoldCount: 0,
    started: false,
    auctionActive: false,
    timerVal: 15,
    timerInterval: null,
    aiTimeout: null,
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code) { return rooms.get(code) || null; }
export function deleteRoom(code) { rooms.delete(code); }
export function getAllRooms() { return [...rooms.values()]; }
