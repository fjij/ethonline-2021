import React, { useEffect } from 'react';
import './App.css';
import { message, channel } from './comms';

function App() {
  useEffect(() => {
    message.listen((msg) => {
      console.log(msg);
    }, channel.matchmaking, { filterSeen: true });
  }, []);
  const text = 'hello from the card game';
  return (
    <>
      <button 
        onClick={() => message.send(new message.Message({ text }), channel.matchmaking)}
      > sendMessage </button>
      <div className="app">
        <h1 className="title">Super Card Game</h1>
      </div>
    </>
  );
}

export default App;
