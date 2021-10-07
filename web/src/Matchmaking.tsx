import React, { useEffect, useState } from 'react';
import useInterval from './hooks/useInterval';
import { message, channel, matchmaking } from './comms';

export default function Matchmaking() {
  const [lfg, setLfg] = useState(false);
  useEffect(() => {
    if (lfg) {
      let unsubscribe: () => void;

      message.listen((msg) => {
        const match = matchmaking.handleMessage(msg);
        if (match) {
          console.log(match);
        }
      }, channel.matchmaking)
        .then(f => unsubscribe = f);

      return () => unsubscribe();
    }
  }, [lfg]);

  useInterval(() => {
    if (lfg) {
      matchmaking.sendMatchPosting();
    }
  }, 1000);

  return (
    <div className="matchmaking">
      { lfg ?
        <>
          <span>{ 'Searching for game...' }</span>
          <button onClick={ () => setLfg(false) }> Stop</button>
        </>:
        <>
          <button onClick={ () => setLfg(true) }> Play </button>
        </>
      }
    </div>
  );
}
