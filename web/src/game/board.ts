import arrayShuffle from 'array-shuffle';
import { crypto } from '../comms';
import { interactions } from '../game';
import { card } from '../eth';

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
  active: {
    card: FaceUpCardState;
    isHero: boolean;
  } | null;
  empower: interactions.Empower | null;
  winner: boolean;
}

export type Phase = 'play' | 'combat' | 'resolution' | 'bonus' | 'draw';

export interface BoardState {
  playerState?: PlayerState;
  otherPlayerState?: PlayerState;
  nextPhase: Phase;
  combatResult?: interactions.InteractionResult | null;
  gameOver: boolean;
}

export function createPlayerState(deck: CardState[]): PlayerState {
  const hashes = deck.map(card => card.hash);
  const duplicates = hashes.filter((hash, idx) => hashes.indexOf(hash) !== idx);
  if (duplicates.length > 0) {
    throw new Error('duplicate card state in deck');
  }
  return {
    points: 0,
    heroes: [],
    hand: [], 
    deck, 
    empower: null,
    active: null,
    winner: false,
  };
}

function playCard(state: PlayerState, card: FaceUpCardState): PlayerState {
  const handIndex = state.hand.map(c => c.hash).indexOf(card.hash);
  const heroIndex = state.heroes.map(c => c.hash).indexOf(card.hash);
  if (handIndex === -1 && heroIndex === -1) {
    throw new Error('played invalid card state');
  }
  if (handIndex >= 0) {
    const newHand = [ ...state.hand ];
    newHand.splice(handIndex, 1);
    return { ...state, hand: newHand, active: { card, isHero: false } };
  } else if (heroIndex >= 0) {
    const newHeroes = [ ...state.heroes ];
    newHeroes.splice(heroIndex, 1);
    return { ...state, heroes: newHeroes, active: { card, isHero: true } };
  } else {
    throw new Error('should not be here');
  }
}

export function playPhase(
  state: BoardState,
  card: FaceUpCardState,
  otherCard: FaceUpCardState
): BoardState {
  if (!state.playerState || !state.otherPlayerState) {
    throw new Error('player states not ready');
  }
  if (state.nextPhase !== 'play') {
    throw new Error('incorrect phase');
  }
  return {
    ...state,
    playerState: playCard(state.playerState, card),
    otherPlayerState: playCard(state.otherPlayerState, otherCard),
    nextPhase: 'combat',
  }
}

export function combatPhase(
  state: BoardState,
  cardData: card.CardData,
  otherCardData: card.CardData,
  randInt: (range: number) => number,
  isFirst: boolean
): BoardState {
  if (!state.playerState || !state.otherPlayerState) {
    throw new Error('player states not ready');
  }
  if (state.nextPhase !== 'combat') {
    throw new Error('incorrect phase');
  }
  const empower = state.playerState.empower;
  const otherEmpower = state.otherPlayerState.empower;
  const keywords = empower 
    ? [ ...cardData.keywords, ...empower.keywords] 
    : cardData.keywords;
  const otherKeywords = otherEmpower 
    ? [ ...otherCardData.keywords, ...otherEmpower.keywords] 
    : otherCardData.keywords;
  const combatResult = interactions.computeInteraction(
    cardData.power, keywords,
    otherCardData.power, otherKeywords,
    isFirst, randInt);

  return {
    ...state,
    playerState: { ...state.playerState, empower: null },
    otherPlayerState: { ...state.otherPlayerState, empower: null },
    nextPhase: 'resolution',
    combatResult,
  }
}

export function resolveSingle(
  state: BoardState, 
  randInt: (range: number) => number,
): BoardState {
  if (state.nextPhase !== 'resolution') {
    throw new Error('incorrect phase');
  }
  const newKeywords = [ ...state.combatResult!.keywords];
  const firstEffect = newKeywords.shift();
  const newState = { 
    ...state, 
    combatResult: { ...state.combatResult!, keywords: newKeywords }
  };
  if (firstEffect) {
    const keyword = firstEffect.result;
    if (keyword.name === 'draw') {
      return drawFor(newState, firstEffect.isOther, randInt, false, keyword.value);
    } else if (keyword.name === 'discard') {
      return discardFor(newState, firstEffect.isOther, randInt, keyword.value);
    } else if (keyword.name === 'empower') {
      return empowerFor(newState, firstEffect.isOther, keyword);
    } else {
      return newState;
    }
  }  else {
    return { ...newState, nextPhase: 'bonus' };
  }
}

export function setupPhase(
  state: BoardState,
  randInt: (range: number) => number,
  isFirst: boolean,
): BoardState {
  if (isFirst) {
    return {
      ...state,
      playerState: draw(state.playerState!, randInt, false, 4),
      otherPlayerState: draw(state.otherPlayerState!, randInt, false, 4),
    }
  } else {
    return {
      ...state,
      otherPlayerState: draw(state.otherPlayerState!, randInt, false, 4),
      playerState: draw(state.playerState!, randInt, false, 4),
    }
  }
}

function hasLost(state: PlayerState): boolean {
  return state.hand.length === 0 
    && state.heroes.length === 0 
    && state.deck.length === 0;
}

function hasWon(state: PlayerState): boolean {
  return state.points >= 3;
}

export function bonusPhase(
  state: BoardState,
  randInt: (range: number) => number,
): BoardState {
  if (state.nextPhase !== 'bonus') {
    throw new Error('incorrect phase');
  }
  let newState: BoardState;
  if (state.combatResult!.won) {
    if (state.playerState!.active!.isHero) {
      newState = addPointFor(state, false);
    } else {
      newState = drawFor(state, false, randInt, true, 1);
    }
  } else if (state.combatResult!.otherWon) {
    if (state.otherPlayerState!.active!.isHero) {
      newState = addPointFor(state, true);
    } else {
      newState = drawFor(state, true, randInt, true, 1);
    }
  } else {
    newState = state;
  }

  newState = {
    ...newState!,
    otherPlayerState: {
      ...newState!.otherPlayerState!,
      active: null,
    },
    combatResult: null,
    nextPhase: 'draw'
  }

  if (hasWon(newState.playerState!)) {
    return { ...newState, 
      playerState: { ...newState.playerState!, winner: true },
      gameOver: true,
    };
  } else if (hasWon(newState.otherPlayerState!)) {
    return { ...newState, 
      otherPlayerState: { ...newState.otherPlayerState!, winner: true },
      gameOver: true,
    };
  } else if (hasLost(newState.playerState!)) {
    return { ...newState, 
      otherPlayerState: { ...newState.otherPlayerState!, winner: true },
      gameOver: true,
    };
  } else if (hasLost(newState.otherPlayerState!)) {
    return { ...newState, 
      playerState: { ...newState.playerState!, winner: true },
      gameOver: true,
    };
  }

  return newState;
}

export function drawPhase(
  state: BoardState,
  randInt: (range: number) => number,
  isFirst: boolean,
): BoardState {
  if (state.nextPhase !== 'draw') {
    throw new Error('incorrect phase');
  }
  const shouldDraw = state.playerState!.hand.length < 4;
  const shouldOtherDraw = state.otherPlayerState!.hand.length < 4;
  let newState: BoardState = state;
  if (shouldDraw && shouldOtherDraw) {
    if (isFirst) {
      newState = drawFor(drawFor(state, false, randInt), true, randInt);
    } else {
      newState = drawFor(drawFor(state, true, randInt), false, randInt);
    }
  } else if (shouldDraw) {
    newState = drawFor(state, false, randInt);
  } else if (shouldOtherDraw) {
    newState = drawFor(state, true, randInt);
  }
  return {
    ...newState,
    nextPhase: 'play'
  };
}

function empowerFor(
  state: BoardState,
  isOther: boolean,
  empower: interactions.Empower,
): BoardState {
  if (isOther) {
    return {
      ...state, otherPlayerState: { ...state.otherPlayerState!, empower }
    }
  } else {
    return {
      ...state, playerState: { ...state.playerState!, empower }
    }
  }
}

function addPointFor(
  state: BoardState,
  isOther: boolean,
): BoardState {
  if (isOther) {
    return {
      ...state, otherPlayerState: { 
        ...state.otherPlayerState!, 
        points: state.otherPlayerState!.points + 1
      }
    }
  } else {
    return {
      ...state, playerState: { 
        ...state.playerState!, 
        points: state.playerState!.points + 1
      }
    }
  }
}

function drawFor(
  state: BoardState,
  isOther: boolean,
  randInt: (range: number) => number,
  isHero: boolean = false,
  count: number = 1,
): BoardState {
  if (isOther) {
    return {
      ...state,
      otherPlayerState: draw(state.otherPlayerState!, randInt, isHero, count)
    };
  } else {
    return {
      ...state,
      playerState: draw(state.playerState!, randInt, isHero, count)
    };
  }
}

function draw(
  state: PlayerState,
  randInt: (range: number) => number,
  isHero: boolean = false,
  count: number = 1,
): PlayerState {
  if (count <= 0) {
    return state;
  }
  if (state.deck.length === 0) {
    return state;
  }
  const index = randInt(state.deck.length);
  const newDeck = [ ...state.deck ];
  newDeck.splice(index, 1);
  if (isHero) {
    console.log('draw hero');
    return draw({
      ...state,
      deck: newDeck,
      heroes: [ ...state.heroes, state.deck[index]]
    }, randInt, isHero, count - 1);
  } else {
    console.log('draw');
    return draw({
      ...state,
      deck: newDeck,
      hand: [ ...state.hand, state.deck[index]]
    }, randInt, isHero, count - 1);
  }
}

function discardFor(
  state: BoardState,
  isOther: boolean,
  randInt: (range: number) => number,
  count: number = 1,
): BoardState {
  if (isOther) {
    return {
      ...state,
      otherPlayerState: discard(state.otherPlayerState!, randInt, count)
    };
  } else {
    return {
      ...state,
      playerState: discard(state.playerState!, randInt, count)
    };
  }
}

function discard(
  state: PlayerState,
  randInt: (range: number) => number,
  count: number = 1,
): PlayerState {
  if (count <= 0) {
    return state;
  }
  if (state.hand.length === 0) {
    return state;
  }
  const index = randInt(state.hand.length);
  const newHand = [ ...state.hand ];
  newHand.splice(index, 1);
  return discard({
    ...state,
    hand: newHand,
  }, randInt, count - 1);
}

export function createDeck(ids: number[]): FaceUpCardState[] {
  return arrayShuffle(ids).map(id => {
    const data = { id, salt: crypto.generateSalt() };
    const hash = crypto.hash(stringify(data));
    return { data, hash };
  });
}
