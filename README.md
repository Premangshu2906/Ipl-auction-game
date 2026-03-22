# 🏏 IPL Auction 2025

Real-time multiplayer IPL cricket auction game. Bid on 150 real players, manage your ₹120 Cr purse, build your dream XI against AI or friends.

---

## Project Structure

```
ipl-auction/
├── client/          ← React + Vite + Tailwind (deploy to Vercel)
├── server/          ← Node.js + Express + Socket.io (deploy to Railway)
└── README.md
```

---

## Local Development

### 1. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 2. Set environment variables

**server/.env**
```
PORT=3001
CLIENT_URL=http://localhost:5173
```

**client/.env**
```
VITE_SERVER_URL=http://localhost:3001
```

### 3. Run both simultaneously

Open two terminals:

```bash
# Terminal 1 — server
cd server && npm run dev

# Terminal 2 — client
cd client && npm run dev
```

Open `http://localhost:5173`

---

## 🚀 Deployment

### Step 1 — Deploy Server to Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo → choose the `server/` folder
3. Railway auto-detects Node.js
4. Add environment variables in Railway dashboard:
   ```
   PORT=3001
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```
5. Deploy. Copy the generated URL (e.g. `https://ipl-auction-server.railway.app`)

### Step 2 — Deploy Client to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set **Root Directory** to `client`
3. Framework preset: **Vite**
4. Add environment variable:
   ```
   VITE_SERVER_URL=https://ipl-auction-server.railway.app
   ```
5. Deploy → your game is live!

### Step 3 — Update CORS on server

Go back to Railway → update `CLIENT_URL` to your actual Vercel URL → redeploy.

---

## Game Rules

| Rule | Detail |
|------|--------|
| Teams | 5 teams · ₹120 Cr purse each |
| Players | 150 total · randomised each game |
| Squad size | 15 players per team |
| Bid increments | ₹20L below ₹5 Cr · ₹25L above |
| Timer | 15 seconds per bid round |
| AI teams | 3 personalities: Aggressive, Smart, Random |

### Squad composition (per 15 players)
- Minimum 4 Batters (BAT)
- Minimum 4 Bowlers (BWL)  
- Minimum 1 Wicketkeeper (WK)
- Minimum 2 All-Rounders (AR)
- 4 Flex slots (any role)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + TailwindCSS |
| State | Zustand |
| Animations | Framer Motion |
| Backend | Node.js + Express |
| Real-time | Socket.io |
| Server host | Railway |
| Client host | Vercel |

---

## Player Pool (150 Players)

| Category | Count | Base Price |
|----------|-------|-----------|
| Capped Batters | 25 | ₹50L–₹2Cr |
| Capped Bowlers | 25 | ₹50L–₹2Cr |
| Capped All-Rounders | 20 | ₹50L–₹2Cr |
| Capped Wicketkeepers | 10 | ₹50L–₹2Cr |
| Uncapped Batters | 20 | ₹20L |
| Uncapped Bowlers | 20 | ₹20L |
| Uncapped All-Rounders | 15 | ₹20L |
| Uncapped Wicketkeepers | 15 | ₹20L |

---

## Possible Next Steps

- [ ] Sound effects (gavel, bid click, timer tick)
- [ ] Confetti on winning a star player
- [ ] Unsold pool round (second chance at lower base)
- [ ] Share-your-squad result card
- [ ] Budget warning flash when purse < ₹10 Cr
- [ ] Role requirement warnings per team
