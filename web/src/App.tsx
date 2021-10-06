import React, { useEffect } from 'react';
import './App.css';
import { addObserver } from './comms';

function App() {
  useEffect(() => {
    addObserver((msg) => {
      console.log(msg);
    }, '');
  }, []);
  return (
    <div className="app">
      <h1 className="title">Super Card Game</h1>
    </div>
  );
}

export default App;
