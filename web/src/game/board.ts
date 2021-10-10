import arrayShuffle from 'array-shuffle';
import { crypto } from '../comms';
import { interactions } from '../game';

const stringify = require('json-stringify-deterministic');

export interface FaceUpCardState {
  data: {
    id: number;
    salt: string;
  };
  hash: string;
}

export interface FaceDownCardState {
  hash: string;
}

export type CardState = FaceUpCardState | FaceDownCardState;

export interface PlayerState {
  points: number;
  heroes: CardState[];
  hand: CardState[];
  deck: CardState[];
  overdrawn: boolean;
  empower: interactions.Empower | null;
}

export interface BoardState {
  playerState?: PlayerState;
  otherPlayerState?: PlayerState;
}

export function hasLost(state: PlayerState): boolean {
  return state.overdrawn;
}

export function hasWon(state: PlayerState): boolean {
  return state.points >= 3;
}

export function createPlayerState(deck: CardState[]): PlayerState {
  const hashes = deck.map(card => card.hash);
  const duplicates = hashes.filter((hash, idx) => hashes.indexOf(hash) !== idx);
  if (duplicates.length > 0) {
    throw new Error('duplicate card state in deck');
  }
  return { points: 0, heroes: [], hand: [], deck, overdrawn: false, empower: null };
}

function playCard(state: PlayerState, card: FaceUpCardState): PlayerState {
  const handIndex = state.hand.map(c => c.hash).indexOf(card.hash);
  const heroIndex = state.heroes.map(c => c.hash).indexOf(card.hash);
  if (handIndex === -1 && heroIndex === -1) {
    throw new Error('played invalid card state');
  }
  const newState = { ...state };
  if (handIndex >= 0) {
    newState.hand.splice(handIndex, 1);
  } else if (heroIndex >= 0) {
    newState.heroes.splice(handIndex, 1);
  }
  return state;
}

export function playCards(
  state: BoardState,
  card: FaceUpCardState,
  otherCard: FaceUpCardState
): BoardState {
  if (!state.playerState || !state.otherPlayerState) {
    throw new Error('player states not ready');
  }
  return {
    ...state,
    playerState: playCard(state.playerState, card),
    otherPlayerState: playCard(state.otherPlayerState, otherCard),
  }
}

export function consumeEmpower(state: PlayerState): PlayerState {
  return { ...state, empower: null };
}

export function draw(
  state: PlayerState,
  randInt: (range: number) => number,
  isHero: boolean = false,
  count: number = 1,
): PlayerState {
  if (count <= 0) {
    return state;
  }
  if (state.deck.length === 0) {
    return { ...state, overdrawn: true };
  }
  const index = randInt(state.deck.length);
  const newState = { ...state };
  newState.deck.splice(index, 1);
  if (isHero) {
    newState.heroes.push(state.deck[index]);
  } else {
    newState.hand.push(state.deck[index]);
  }
  return draw(newState, randInt, isHero, count - 1);
}

export function discard(
  state: PlayerState,
  randInt: (range: number) => number,
  count: number = 1,
): PlayerState {
  if (count <= 0) {
    return state;
  }
  const index = randInt(state.hand.length);
  const newState = { ...state };
  newState.hand.splice(index, 1);
  return discard(newState, randInt, count - 1);
}

export function createDeck(ids: number[]): FaceUpCardState[] {
  return arrayShuffle(ids).map(id => {
    const data = { id, salt: crypto.generateSalt() };
    const hash = crypto.hash(stringify(data));
    return { data, hash };
  });
}
