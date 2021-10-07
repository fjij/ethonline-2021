import React from 'react';
import Matchmaking from './Matchmaking';
import ConnectWallet from './ConnectWallet';
import './App.css';

function App() {
  return (
    <>
      <div className="app">
        <h1 className="title">Super Card Game</h1>
        <ConnectWallet />
        <Matchmaking />
      </div>
    </>
  );
}

export default App;
