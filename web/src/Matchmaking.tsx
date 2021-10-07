import React, { useEffect, useState } from 'react';
import { message, channel } from './comms';

export default function Matchmaking() {
  const [lfg, setLfg] = useState(false);
  useEffect(() => {
    if (lfg) {
      let unsubscribe: () => void;
      message.listen((msg) => {
        console.log(msg.sender);
        console.log(msg.data);
      }, channel.matchmaking).then(f => unsubscribe = f);
      return () => {
        unsubscribe();
      }
    } else {
    }
  }, [lfg]);
  const data = { text: 'pulse' };
  return (
    <div className="matchmaking">
      { lfg ?
        <>
          <span>{ 'Searching for game...' }</span>
          <button onClick={ () => message.send(data, channel.matchmaking) }> Stop</button>
          <button onClick={ () => setLfg(false) }> Stop</button>
        </>:
        <>
          <button onClick={ () => setLfg(true) }> Play </button>
        </>
      }
    </div>
  );
}
