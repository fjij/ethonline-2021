import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Card from './Card';
import { channel, crypto } from '../comms';
import { card, wallet } from '../eth';
import { interactions, board } from '../game';
import useSync from '../hooks/useSync';

const gen = require('random-seed');

const SEED_BYTES = 12;

interface SetupMove {
  key: 'setup-move';
  deck: board.FaceDownCardState[];
  seed: string;
}

interface CardMove {
  key: 'card-move';
  card: board.FaceUpCardState;
  seed: string;
}

type Move = SetupMove | CardMove;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function Game() {

  const { other }: any = useParams();

  const addresses = [wallet.getAddress(), other];
  addresses.sort();
  const isFirst = addresses[0] === wallet.getAddress();

  const [text, setText] = useState('');
  const [canMove, setCanMove] = useState(true);

  const [myCard, setMyCard] = useState<board.FaceUpCardState | undefined>();
  const [otherCard, setOtherCard] = useState<board.FaceUpCardState | undefined>();

  const [selectedCard, setSelectedCard] = useState<board.FaceUpCardState | undefined>();

  const [boardState, setBoardState] = useState<board.BoardState>({});

  const playMove = useSync(onMoves, channel.CreateGameChannel(other), other);

  async function handleKeywordResult(
    result: interactions.OwnedKeywordResult,
    randInt: (range: number) => number
  ) {
    await sleep(800);
    const keyword = result.result;
    switch (keyword.name) {
      case 'draw':
      {
        console.log(JSON.stringify(keyword));
        if (result.isOther) {
          setBoardState(state => ({
            ...state,
            otherPlayerState: board.draw(
              state.otherPlayerState!, randInt, false, keyword.value)
          }));
        } else {
          setBoardState(state => ({
            ...state,
            playerState: board.draw(
              state.playerState!, randInt, false, keyword.value)
          }));
        }
        break;
      }
      case 'discard':
      {
        console.log(JSON.stringify(keyword));
        if (result.isOther) {
          setBoardState(state => ({
            ...state,
            otherPlayerState: board.discard(
              state.otherPlayerState!, randInt, keyword.value)
          }));
        } else {
          setBoardState(state => ({
            ...state,
            playerState: board.discard(
              state.playerState!, randInt, keyword.value)
          }));
        }
        break;
      }
      case 'empower':
      {
        console.log(JSON.stringify(keyword));
        if (result.isOther) {
          setBoardState(state => ({
            ...state,
            otherPlayerState: {
              ...state.otherPlayerState!,
              empower: keyword
            }
          }));
        } else {
          setBoardState(state => ({
            ...state,
            playerState: {
              ...state.playerState!,
              empower: keyword
            }
          }));
        }
        break;
      }
      case 'flip':
      case 'fail':
      case 'plus':
      case 'immune':
      case 'swap':
      case 'inflict':
      case 'squelch':
      {
        console.log(JSON.stringify(keyword));
      }
    }
    console.log(result);
  }

  async function onMoves(move: Move, otherMove: Move) {
    const seed = isFirst
      ? `${move.seed}${otherMove.seed}`
      : `${otherMove.seed}${move.seed}`;
    const randInt = gen.create(seed);

    if (move.key === 'card-move' && otherMove.key === 'card-move') {

      setBoardState(state => board.playCards(state, move.card, otherMove.card));
      setSelectedCard(undefined);
      setMyCard(move.card);
      setOtherCard(otherMove.card);
      const [cardData, otherCardData] = await Promise.all([
        card.getCardData(move.card.data.id), card.getCardData(otherMove.card.data.id),
      ]);

      const result = interactions.computeInteraction(
        cardData.power, cardData.keywords,
        otherCardData.power, otherCardData.keywords,
        isFirst, randInt);

      for (let i = 0; i < result.keywords.length; i ++) {
        await handleKeywordResult(result.keywords[i], randInt);
      }

      // Draw cards if less than 4
      setBoardState(state => {
        let newState, newOtherState;
        if (isFirst) {
          if (state.playerState!.hand.length < 4) {
            newState = board.draw(state.playerState!, randInt);
          }
          if (state.otherPlayerState!.hand.length < 4) {
            newOtherState = board.draw(state.otherPlayerState!, randInt);
          }
        } else {
          if (state.otherPlayerState!.hand.length < 4) {
            newOtherState = board.draw(state.otherPlayerState!, randInt);
          }
          if (state.playerState!.hand.length < 4) {
            newState = board.draw(state.playerState!, randInt);
          }
        }
        return {
          playerState: newState,
          otherPlayerState: newOtherState,
        }
      });

      if (result.won) {
        setText('you\'re winner!');
      } else {
        setText('you\'re NOT winner!');
      }

    } else if (move.key === 'setup-move' && otherMove.key === 'setup-move') {

      setBoardState(boardState => {
        const otherPlayerState = board.createPlayerState(otherMove.deck)
        if (isFirst) {
          const newState = board.draw(boardState.playerState as board.PlayerState, randInt, false, 4);
          const newOtherState = board.draw(otherPlayerState, randInt, false, 4);
          return {
            playerState: newState,
            otherPlayerState: newOtherState,
          }
        } else {
          const newOtherState = board.draw(otherPlayerState, randInt, false, 4);
          const newState = board.draw(boardState.playerState as board.PlayerState, randInt, false, 4);
          return {
            playerState: newState,
            otherPlayerState: newOtherState,
          }
        }
      });

    } else {
      throw new Error('illegal move');
    }
    setCanMove(true);
  }

  function play() {
    if (selectedCard) {
      const move: CardMove = {
        key: 'card-move',
        card: selectedCard,
        seed: crypto.b64encode(crypto.randomBytes(SEED_BYTES))
      }
      playMove(move);
      setCanMove(false);
    }
  }

  function setupDeck() {
    const deck: board.FaceUpCardState[] = board.createDeck([
      1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10,
      11, 11, 12, 12, 13
    ]);
    setBoardState(boardState => ({
      ...boardState,
      playerState: board.createPlayerState(deck) 
    }));
    const move: SetupMove = {
      key: 'setup-move',
      deck: deck.map(({ hash }) => ({ hash })),
      seed: crypto.b64encode(crypto.randomBytes(SEED_BYTES))
    }
    playMove(move);
    setCanMove(false);
  }

  return (
    <div className="game">
    { !boardState.playerState && 
      <div>
        <button onClick={() => setupDeck()}>Setup Deck</button>
      </div>
    }
    { boardState.playerState && !boardState.otherPlayerState &&
      <div>
        Waiting for other player to setup deck...
      </div>
    }
    { boardState.playerState && boardState.otherPlayerState &&
      <div className="board">
        <h1>FIGHT</h1>
        <div>
          <p>{ text }</p>
          {
            myCard && <Card id={myCard.data.id} disabled />
          }
          <span> vs </span>
          {
            otherCard && <Card id={otherCard.data.id} disabled />
          }
        </div>
        <br />
        <div>
          <p>Deck: {boardState.playerState.deck.length}</p>
          <h1>Choose a card</h1>
          <button onClick={play} disabled={!canMove || !selectedCard}>Confirm</button>
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
      </div>
    }
    </div>
  );
}
