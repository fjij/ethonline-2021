import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Card from './Card';
import { channel, crypto } from '../comms';
import { card, wallet } from '../eth';
import { interactions, board } from '../game';
import useGameState from '../hooks/useGameState';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function PlayerStatus({state, name}: {state: board.PlayerState, name: string}) {
  let text = `Deck: ${state.deck.length}`
  + ` | Hand: ${state.hand.length}`
  + ` | Heroes: ${state.heroes.length}`
  + ` | Points: ${state.points}`;
  if (state.empower) {
    text += ` | ${interactions.keywordToText(state.empower)}`
  }
  return (
    <div>
      <h3>{name}</h3>
      <p>{text}</p>
    </div>
  );
}

export default function Game() {

  const { other }: any = useParams();

  const [text, setText] = useState('');
  const [selectedCard, setSelectedCard] = useState<board.FaceUpCardState | undefined>();
  const [boardState, setupDeck, playCard, canMove] = useGameState(other, onUpdate);

  const deck = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
  ];

  function play() {
    if (selectedCard) {
      playCard(selectedCard);
    }
  }

  async function onUpdate() {
    await sleep(1000);
  }

  return (
    <div className="game">
    { !boardState.playerState && 
      <div>
        <button onClick={() => setupDeck(deck)}>Setup Deck</button>
      </div>
    }
    { boardState.playerState && !boardState.otherPlayerState &&
      <div>
        Waiting for other player to setup deck...
      </div>
    }
    { boardState.playerState && boardState.otherPlayerState &&
      <div className="board">
        <PlayerStatus state={boardState.playerState} name='Me' />
        <span>vs</span>
        <PlayerStatus state={boardState.otherPlayerState} name='Opponent' />
        { boardState.playerState.active && boardState.otherPlayerState.active &&
          <div>
            <h1>FIGHT</h1>
            {
              <Card id={boardState.playerState.active.card.data.id} disabled />
            }
            <span> vs </span>
            {
              <Card id={boardState.otherPlayerState.active.card.data.id} disabled />
            }
            <p>{ text }</p>
          </div>
        }
        <br />
        <div>
          <h1>Choose a card</h1>
          <div>
            <h2>Hand</h2>
            {
              boardState.playerState.hand.map(card => card as board.FaceUpCardState)
                .map(card => <Card
                  onClick={() => setSelectedCard(card)}
                  id={card.data.id}
                  key={card.hash}
                  disabled={!canMove}
                  selected={selectedCard?.hash === card.hash}
                />)
            }
          </div>
          { boardState.playerState.heroes.length > 0 &&
            <div>
              <h2>Heroes</h2>
              {
                boardState.playerState.heroes.map(card => card as board.FaceUpCardState)
                  .map(card => <Card
                    onClick={() => setSelectedCard(card)}
                    id={card.data.id}
                    key={card.hash}
                    disabled={!canMove}
                    selected={selectedCard?.hash === card.hash}
                  />)
              }
            </div>
          }
          <button onClick={play} disabled={!canMove || !selectedCard}>Confirm</button>
        </div>
      </div>
    }
    </div>
  );
}
