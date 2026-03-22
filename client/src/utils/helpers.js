export function fmtLakhs(v) {
  if (!v && v !== 0) return '—';
  if (v >= 100) {
    const cr = v / 100;
    return '₹' + (Number.isInteger(cr) ? cr : cr.toFixed(2)) + ' Cr';
  }
  return '₹' + v + 'L';
}

export function incr(bid) { return bid < 500 ? 20 : 25; }

export function roleFull(role) {
  return { BAT: 'Batsman', BWL: 'Bowler', AR: 'All-Rounder', WK: 'Wicketkeeper' }[role] || role;
}

export function getInitials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export function pct(rem, total = 12000) {
  return Math.max(4, Math.min(96, Math.round((rem / total) * 100)));
}

export function fakeStats(player) {
  const r = Math.random;
  if (player.role === 'BAT' || player.role === 'WK') {
    const avg = player.cap === 'C' ? (28 + Math.floor(r() * 30)) : (15 + Math.floor(r() * 20));
    const sr = player.cap === 'C' ? (120 + Math.floor(r() * 60)) : (100 + Math.floor(r() * 45));
    const m = player.cap === 'C' ? (40 + Math.floor(r() * 120)) : (10 + Math.floor(r() * 35));
    return [{ val: avg, lbl: 'Avg' }, { val: sr, lbl: 'S/R' }, { val: m, lbl: 'Matches' }, { val: Math.round(avg * m * 0.55), lbl: 'Runs' }];
  }
  if (player.role === 'BWL') {
    const avg = player.cap === 'C' ? (22 + Math.floor(r() * 12)) : (28 + Math.floor(r() * 14));
    const econ = (player.cap === 'C' ? (7 + r() * 3) : (8 + r() * 3)).toFixed(1);
    const m = player.cap === 'C' ? (35 + Math.floor(r() * 100)) : (8 + Math.floor(r() * 28));
    return [{ val: avg, lbl: 'Bowl Avg' }, { val: econ, lbl: 'Econ' }, { val: m, lbl: 'Matches' }, { val: Math.round(m * 1.2), lbl: 'Wickets' }];
  }
  const avg = player.cap === 'C' ? (22 + Math.floor(r() * 22)) : (14 + Math.floor(r() * 16));
  const sr = player.cap === 'C' ? (130 + Math.floor(r() * 50)) : (110 + Math.floor(r() * 40));
  const m = player.cap === 'C' ? (50 + Math.floor(r() * 100)) : (15 + Math.floor(r() * 35));
  return [{ val: avg, lbl: 'Bat Avg' }, { val: sr, lbl: 'S/R' }, { val: m, lbl: 'Matches' }, { val: Math.floor(m * 0.7), lbl: 'Wickets' }];
}

export const ROLE_COLORS = {
  BAT: 'bg-amber-500/10 border-amber-500/30',
  BWL: 'bg-red-500/10 border-red-500/30',
  AR: 'bg-green-500/10 border-green-500/30',
  WK: 'bg-blue-500/10 border-blue-500/30',
};

export const ROLE_TEXT = {
  BAT: 'text-amber-400',
  BWL: 'text-red-400',
  AR: 'text-green-400',
  WK: 'text-blue-400',
};
