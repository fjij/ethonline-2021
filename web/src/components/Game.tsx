import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { message, channel, game } from '../comms';

export default function Game() {

  const { other }: any = useParams();

  const [_, setSyncState] = useState(game.baseState(other, onMoves));
  const [logs, setLogs] = useState<{ text: string, id: number }[]>([]);
  const [canMove, setCanMove] = useState(true);

  useEffect(() => {
    return message.listen((msg) => {
      setSyncState(state => game.handleMessage(state, msg));
    }, channel.CreateGameChannel(other));
  }, []);

  function addLog(text: string) {
    setLogs(logs => [...logs, { text, id: logs.length }]);
  }

  function onMoves(move: any, otherMove: any) {
    addLog(`fight! ${move} vs ${otherMove}`);
    if (move === otherMove) {
      addLog('tie.');
    } else if (move === 'rock') {
      if (otherMove === 'scissors')  {
        addLog('win!');
      } else {
        addLog('lose...');
      }
    } else if (move === 'paper') {
      if (otherMove === 'rock')  {
        addLog('win!');
      } else {
        addLog('lose...');
      }
    } else {
      if (otherMove === 'paper')  {
        addLog('win!');
      } else {
        addLog('lose...');
      }
    }
    setCanMove(true);
  }

  function play(move: string) {
    setSyncState(state => game.playMove(state, move));
    addLog(`you played ${move}`);
    setCanMove(false);
  }

  return (
    <div className="game">
      <h1>Game</h1>
      <div>
        <button onClick={() => play('rock')} disabled={!canMove}>rock</button>
        <button onClick={() => play('paper')} disabled={!canMove}>paper</button>
        <button onClick={() => play('scissors')} disabled={!canMove}>scissors</button>
      </div>
      <br />
      <div>
        { logs.map(log => <p key={ log.id }>{ log.text }<br /></p>) }
      </div>
    </div>
  );
}
