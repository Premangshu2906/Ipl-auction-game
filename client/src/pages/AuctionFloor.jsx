import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import { useSocket } from '../hooks/useSocket.js';
import PlayerCard from '../components/PlayerCard.jsx';
import BidZone from '../components/BidZone.jsx';
import ResultBanner from '../components/ResultBanner.jsx';
import TeamsPanel from '../components/TeamsPanel.jsx';
import SquadMini from '../components/SquadMini.jsx';
import CategoryAnnouncement from '../components/CategoryAnnouncement.jsx';
import { TeamLogo } from '../utils/teams.jsx';

export default function AuctionFloor() {
  const { code } = useParams();
  const navigate = useNavigate();
  const {
    currentPlayer, lot, soldCount, unsoldCount, poolLength,
    teams, playerTeamIdx, auctionEnded, currentCategory,
  } = useGameStore();
  useSocket();

  useEffect(() => {
    if (auctionEnded) navigate('/results');
  }, [auctionEnded]);

  const myTeam = teams[playerTeamIdx];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#07090F' }}>

      {/* Top bar */}
      <div className="bg-s1 border-b border-[rgba(245,166,35,0.18)] px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        {/* Logo left */}
        <div className="flex items-center gap-2">
          <div style={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg, #c27d0e, #F5A623)',
            clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>🔨</div>
          <div className="font-bebas text-lg tracking-[3px] text-gold">LET'S BID</div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          {[
            [poolLength, 'Pool'],
            [soldCount, 'Sold'],
            [unsoldCount, 'Unsold'],
            [`LOT ${lot}`, 'Current'],
          ].map(([v, l]) => (
            <div key={l} className="text-right">
              <div className="font-condensed font-bold text-sm text-[#E8EAF2] leading-none">{v}</div>
              <div className="text-[9px] uppercase tracking-widest text-[#5A6478] font-condensed">{l}</div>
            </div>
          ))}

          {/* Your team chip */}
          {myTeam && (
            <div className="flex items-center gap-1.5 border-l border-[rgba(245,166,35,0.2)] pl-4">
              <TeamLogo teamId={myTeam.id} size={26} />
              <div>
                <div className="font-bebas text-sm text-gold leading-none">{myTeam.short}</div>
                <div className="text-[9px] text-[#5A6478] font-condensed">{myTeam.squad.length}/15</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: content */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {currentCategory ? (
            <CategoryAnnouncement category={currentCategory} />
          ) : (
            <>
              <PlayerCard player={currentPlayer} lot={lot} poolLength={poolLength} />
              <ResultBanner roomCode={code} />
              <BidZone roomCode={code} />
            </>
          )}
        </div>

        {/* Right sidebar */}
        <div className="w-52 bg-s1 border-l border-[rgba(245,166,35,0.2)] overflow-y-auto p-3 flex flex-col gap-3 flex-shrink-0">
          <div>
            <div className="text-[10px] uppercase tracking-[3px] text-[#5A6478] font-condensed mb-2">Teams &amp; Purses</div>
            <TeamsPanel />
          </div>
          <div className="border-t border-[rgba(245,166,35,0.2)] pt-3">
            <div className="text-[10px] uppercase tracking-[3px] text-[#5A6478] font-condensed mb-2">
              Your Squad · {myTeam?.short}
            </div>
            <SquadMini />
          </div>
        </div>

      </div>
    </div>
  );
}
