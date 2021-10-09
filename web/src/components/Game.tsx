import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Card from './Card';
import { message, channel, game, crypto } from '../comms';
import { card, wallet } from '../eth';
import { interactions } from '../game';

const SEED_BYTES = 12;

interface Move {
  id: number;
  seed: string;
}

function isFirst(other: string) {
  const addresses = [wallet.getAddress(), other];
  addresses.sort();
  return addresses[0] === wallet.getAddress();
}

export default function Game() {

  const { other }: any = useParams();

  const [syncState, setSyncState] = useState(game.baseState(other));
  const [text, setText] = useState('');
  const [canMove, setCanMove] = useState(true);
  const [myCard, setMyCard] = useState<number | undefined>();
  const [otherCard, setOtherCard] = useState<number | undefined>();

  useEffect(() => {
    return message.listen((msg) => {
      setSyncState(state => game.handleMessage(state, msg));
    }, channel.CreateGameChannel(other));
  }, []);

  useEffect(() => {
    if (syncState.todo.outgoing.length > 0) {
      setSyncState(state => {
        state.todo.outgoing.forEach(data => {
          message.send(data, channel.CreateGameChannel(other));
        });
        return { ...state, todo: { ...state.todo, outgoing: [] } };
      });
    }
  }, [syncState.todo.outgoing]);

  useEffect(() => {
    if (syncState.todo.turns.length > 0) {
      setSyncState(state => {
        state.todo.turns.forEach(turn => {
          onMoves(turn.move, turn.otherMove);
        });
        return { ...state, todo: { ...state.todo, turns: [] } };
      });
    }
  }, [syncState.todo.turns]);
  
  useEffect(() => {
    console.log('syncState updated - salt: ', syncState);
  }, [syncState]);

  async function onMoves(move: Move, otherMove: Move) {
    setOtherCard(otherMove.id);
    const [cardData, otherCardData] = await Promise.all([
      card.getCardData(move.id), card.getCardData(otherMove.id),
    ]);
    const seed = isFirst(other) ?
      `${move.seed}${otherMove.seed}` : `${otherMove.seed}${move.seed}`;
    const isWinner = interactions.isWinner(
      cardData.power, cardData.keywords,
      otherCardData.power, otherCardData.keywords,
      isFirst(other), seed);
    if (isWinner) {
      setText('you\'re winner!');
    } else {
      setText('you\'re NOT winner!');
    }
    setCanMove(true);
  }

  function play(id: number) {
    setMyCard(id);
    const move: Move = {
      id,
      seed: crypto.b64encode(crypto.randomBytes(SEED_BYTES))
    }
    setSyncState(state => {
      const newState = game.playMove(state, move)
      console.log(newState.data.move?.salt);
      return newState
    });
    setText(`you played card ${id}`);
    setCanMove(false);
  }

  return (
    <div className="game">
      <h1>FIGHT</h1>
      <div>
        <p>{ text }</p>
        {
          myCard && <Card id={myCard} />
        }
        <span> vs </span>
        {
          otherCard && <Card id={otherCard} />
        }
      </div>
      <br />
      { canMove &&
        <div>
          <h1>Choose a card</h1>
          { Array.from(Array(43).keys()).map(id => 
            <Card onClick={() => play(id)} id={id} key={id} />)
          }
        </div>
      }
    </div>
  );
}
