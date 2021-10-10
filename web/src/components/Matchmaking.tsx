import React, { useEffect, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import useInterval from '../hooks/useInterval';
import { message, channel, matchmaking } from '../comms';

export default function Matchmaking() {

  const MAX_NEGOTIATION_COUNTER = 5;

  const [lfg, setLfg] = useState(false);
  const [state, setState] = useState<matchmaking.State>({ key: 'none' });
  const [negotiationCounter, setNegotiationCounter] = useState(0);

  const [backupLink, setBackupLink] = useState<string>();

  const history = useHistory();

  useEffect(() => {
    if (lfg) {
      setNegotiationCounter(0);
      setState({ key: 'searching' });
      return message.listen((msg) => {
        console.log(msg.data, msg.sender);
        setState(state => matchmaking.handleMessage(state, msg));
      }, channel.matchmaking);
    } else {
      setState({ key: 'none' });
    }
  }, [lfg]);

  useInterval(() => {
    if (lfg) {
      if (state.key === 'searching') {
        matchmaking.sendMatchPosting();
      } else if (state.key === 'negotiating') {
        if (negotiationCounter < MAX_NEGOTIATION_COUNTER) {
          setNegotiationCounter(x => x + 1);
        } else {
          setNegotiationCounter(0);
          setState(s => s.key === 'negotiating' ? { key: 'searching' } : s);
        }
      }
    }
  }, 3000);

  useEffect(() => {
    if (state.key === 'found') {
      history.push(`/game/${state.other}`);
      setBackupLink(`/game/${state.other}`);
    }
  // eslint-disable-next-line
  }, [state.key, history]);

  return (
    <div className="matchmaking">
      { lfg ?
        <>
          <p>{ state.key }</p>
          { backupLink && <Link to={backupLink}>Click here you aren't automatically redirected...</Link>
          }
          <button onClick={ () => setLfg(false) }> Stop</button>
        </>:
        <>
          <button onClick={ () => setLfg(true) }> Play </button>
        </>
      }
    </div>
  );
}
