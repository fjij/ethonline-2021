import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { message, channel, game } from '../comms';

export default function Game() {

  const { other }: any = useParams();
  const [_, setSyncState] = useState(game.baseState(other, onMoves));

  useEffect(() => {
    return message.listen((msg) => {
      setSyncState(state => game.handleMessage(state, msg));
    }, channel.CreateGameChannel(other));
  }, []);

  function onMoves(move: any, otherMove: any) {
    console.log(`fight! ${move} vs ${otherMove}`);
  }

  function play(move: string) {
    setSyncState(state => game.playMove(state, move));
    console.log(`you played ${move}`);
  }

  return (
    <div className="game">
      <h1>Game</h1>
      <button onClick={() => play('rock')}>rock</button>
      <button onClick={() => play('paper')}>paper</button>
      <button onClick={() => play('scissors')}>scissors</button>
    </div>
  );
}
