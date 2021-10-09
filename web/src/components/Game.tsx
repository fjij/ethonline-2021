import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Card from './Card';
import { channel, crypto } from '../comms';
import { card, wallet } from '../eth';
import { interactions } from '../game';
import useSync from '../hooks/useSync';

const gen = require('random-seed');

const SEED_BYTES = 12;

interface Move {
  id: number;
  seed: string;
}

export default function Game() {

  const { other }: any = useParams();

  const addresses = [wallet.getAddress(), other];
  addresses.sort();
  const isFirst = addresses[0] === wallet.getAddress();

  const [text, setText] = useState('');
  const [canMove, setCanMove] = useState(true);
  const [myCard, setMyCard] = useState<number | undefined>();
  const [otherCard, setOtherCard] = useState<number | undefined>();

  const playMove = useSync(onMoves, channel.CreateGameChannel(other), other);

  async function onMoves(move: Move, otherMove: Move) {
    setOtherCard(otherMove.id);
    const [cardData, otherCardData] = await Promise.all([
      card.getCardData(move.id), card.getCardData(otherMove.id),
    ]);
    const seed = isFirst ?
      `${move.seed}${otherMove.seed}` : `${otherMove.seed}${move.seed}`;
    const randInt = gen.create(seed);
    const result = interactions.computeInteraction(
      cardData.power, cardData.keywords,
      otherCardData.power, otherCardData.keywords,
      isFirst, randInt);
    if (result.won) {
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
    playMove(move);
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
