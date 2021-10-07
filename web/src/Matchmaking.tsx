import React, { useEffect, useState } from 'react';
import useInterval from './hooks/useInterval';
import { message, channel, matchmaking } from './comms';

export default function Matchmaking() {

  const [lfg, setLfg] = useState(false);
  const [state, setState] = useState<matchmaking.State>({ key: 'none' });

  useEffect(() => {
    if (lfg) {
      setState({ key: 'searching' });
      return message.listen((msg) => {
        console.log(new Date(msg.getTimestamp()));
        setState(state => matchmaking.handleMessage(state, msg));
      }, channel.matchmaking);
    } else {
      setState({ key: 'none' });
    }
  }, [lfg],);

  useInterval(() => {
    if (lfg) {
      if (state.key === 'searching') {
        matchmaking.sendMatchPosting();
      } 
    }
  }, 3500);

  return (
    <div className="matchmaking">
      { lfg ?
        <>
          <p>{ 'Searching for game...' }</p>
          <p>{ state.key }</p>
          <button onClick={ () => setLfg(false) }> Stop</button>
        </>:
        <>
          <button onClick={ () => setLfg(true) }> Play </button>
        </>
      }
    </div>
  );
}
