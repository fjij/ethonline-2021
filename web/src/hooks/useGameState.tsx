import { useEffect, useState, useRef } from 'react';

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

export default function useGameState(other: string):
[board.BoardState, (ids: number[]) => void, (card: board.FaceUpCardState) => void, boolean]
{
  const addresses = [wallet.getAddress(), other];
  addresses.sort();
  const isFirst = addresses[0] === wallet.getAddress();

  const [boardState, setBoardState] = useState<board.BoardState>({ nextPhase: 'play' });

  const [data, setData] = useState<{ card: card.CardData, id: number } | undefined>();
  const [otherData, setOtherData] = useState<{ card: card.CardData, id: number } | undefined>();
  const [seed, setSeed] = useState<string>();

  const randInt = useRef<(range: number) => number>();

  const [canMove, setCanMove] = useState(true);

  const playMove = useSync(onMoves, channel.CreateGameChannel(other), other);


  useEffect(() => {
    randInt.current = gen.create(seed);
  }, [seed]);

  function getSeed(move: Move, otherMove: Move) {
    return isFirst
      ? `${move.seed}${otherMove.seed}`
      : `${otherMove.seed}${move.seed}`;
  }

  function onSetupMoves(move: SetupMove, otherMove: SetupMove) {
    const randInt = gen.create(getSeed(move, otherMove));
    setBoardState(state => {
      const otherPlayerState = board.createPlayerState(otherMove.deck);
      return board.setupPhase({ ...state, otherPlayerState }, randInt, isFirst);
    });
    setCanMove(true);
  }

  useEffect(() => {
    if (boardState.nextPhase === 'play') {
      setCanMove(true);
    }

    if (boardState.nextPhase === 'resolution') {
      setBoardState(state => board.resolveSingle(state, randInt.current!));
    } else if (boardState.nextPhase === 'bonus') {
      setBoardState(state => board.bonusPhase(state, randInt.current!));
    } else if (boardState.nextPhase === 'draw') {
      setBoardState(state => board.drawPhase(state, randInt.current!, isFirst));
    }
  }, [boardState.nextPhase, boardState.combatResult?.keywords]);

  useEffect(() => {
    if (boardState.nextPhase === 'combat') {
      const id = boardState.playerState!.active!.card.data.id;
      const otherId = boardState.otherPlayerState!.active!.card.data.id;
      if (data?.id === id) {
        if (otherData?.id === otherId) {
          setBoardState(state => board.combatPhase(
            state, data!.card, otherData!.card, randInt.current!, isFirst
          ));
        } else {
          card.getCardData(id).then(cardData => setData({ card: cardData, id }));
        }
      } else {
        card.getCardData(id).then(cardData => setData({ card: cardData, id }));
      }
    } 
  }, [boardState.nextPhase, data, otherData]);

  async function onCardMoves(move: CardMove, otherMove: CardMove) {
    setSeed(getSeed(move, otherMove));
    setBoardState(state => board.playPhase(state, move.card, otherMove.card));
  }

  async function onMoves(move: Move, otherMove: Move) {
    if (move.key === 'card-move' && otherMove.key === 'card-move') {
      onCardMoves(move, otherMove);
    } else if (move.key === 'setup-move' && otherMove.key === 'setup-move') {
      onSetupMoves(move, otherMove);
    } else {
      throw new Error('illegal move');
    }
  }

  function playCard(card: board.FaceUpCardState) {
    if (canMove) {
      const move: CardMove = {
        key: 'card-move', card,
        seed: crypto.b64encode(crypto.randomBytes(SEED_BYTES))
      }
      playMove(move);
      setCanMove(false);
    }
  }

  function setupDeck(ids: number[]) {
    if (canMove) {
      const deck: board.FaceUpCardState[] = board.createDeck(ids);
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
    }
    setCanMove(false);
  }

  return [boardState, setupDeck, playCard, canMove];
}
