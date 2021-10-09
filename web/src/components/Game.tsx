import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { message, channel, game } from '../comms';

export default function Game() {

  const { other }: any = useParams();

  const [_, setSyncState] = useState(game.baseState(other, onMoves));
  const [text, setText] = useState('');
  const [canMove, setCanMove] = useState(true);

  useEffect(() => {
    return message.listen((msg) => {
      setSyncState(state => game.handleMessage(state, msg));
    }, channel.CreateGameChannel(other));
  }, []);

  function onMoves(move: any, otherMove: any) {
    let str = `fight! ${move} vs ${otherMove} -- `;
    if (move === otherMove) {
      str += 'tie.';
    } else if (move === 'rock') {
      if (otherMove === 'scissors')  {
        str += 'win!';
      } else {
        str += 'lose...';
      }
    } else if (move === 'paper') {
      if (otherMove === 'rock')  {
        str += 'win!';
      } else {
        str += 'lose...';
      }
    } else {
      if (otherMove === 'paper')  {
        str += 'win!';
      } else {
        str += 'lose...';
      }
    }
    setText(str);
    setCanMove(true);
  }

  function play(move: string) {
    setSyncState(state => game.playMove(state, move));
    setText(`you played ${move}`);
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
        <p>{ text }</p>
      </div>
    </div>
  );
}
