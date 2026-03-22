import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Lobby from './pages/Lobby.jsx';
import TeamSelect from './pages/TeamSelect.jsx';
import MpLobby from './pages/MpLobby.jsx';
import AuctionFloor from './pages/AuctionFloor.jsx';
import Results from './pages/Results.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/select" element={<TeamSelect />} />
      <Route path="/lobby/:code" element={<MpLobby />} />
      <Route path="/auction/:code" element={<AuctionFloor />} />
      <Route path="/results" element={<Results />} />
    </Routes>
  </BrowserRouter>
);
