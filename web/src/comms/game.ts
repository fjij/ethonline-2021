import * as message from './message';
import * as channel from './channel';
import * as crypto from './crypto';

const stringify = require('json-stringify-deterministic');

const SALT_BYTES = 12;

export interface SaltedData {
  data: any;
  salt: string;
}

interface Turn {
  num: number;
  phase: 'setup' | 'reveal';
}


export interface SyncState {
  turn: Turn,
  other: string;
  status: {
    sent: boolean;
    received: boolean;
  };
  data: {
    move: SaltedData | null;
    otherHash: string | null;
    otherMove: SaltedData | null;
  };
  todo: {
    outgoing: (MoveSetup | MoveReveal)[],
    turns: { move: any, otherMove: any }[]
  };
}

interface MoveSetup {
  key: 'setup';
  turn: Turn;
  hash: string;
}

interface MoveReveal {
  key: 'reveal';
  turn: Turn;
  move: SaltedData;
}

export function baseState(other: string): SyncState {
  return {
    turn: { num: 0, phase: 'setup' },
    other,
    status: { sent: false, received: false },
    data: { move: null, otherHash: null, otherMove: null },
    todo: { outgoing: [], turns: [] },
  }
}

function generateSalt() {
  return crypto.b64encode(crypto.randomBytes(SALT_BYTES));
}

export function playMove(state: SyncState, move: any): SyncState {
  if (state.status.sent || state.turn.phase !== 'setup') {
    return state;
  }
  const saltedData: SaltedData = { data: move, salt: generateSalt() };
  const data: MoveSetup = {
    key: 'setup',
    hash: crypto.hash(stringify(saltedData)),
    turn: state.turn,
  }
  return markSent(send({ ...state, data: { ...state.data, move: saltedData } }, data));
}

export function handleMessage(state: SyncState, msg: message.Message): SyncState {
  if (msg.getSender() !== state.other) {
    return state;
  }
  const data: MoveSetup | MoveReveal = msg.getData();
  switch (data.key) {
    case 'setup': {
      return onSetup(state, data);
    }
    case 'reveal': {
      return onReveal(state, data);
    }
  }
}

function send(state: SyncState, data: MoveReveal | MoveSetup) {
  return {
    ...state,
    todo: {
      ...state.todo,
      outgoing: [...state.todo.outgoing, data]
    }
  };
}

function markSent(state: SyncState): SyncState {
  return handleTurnStatusUpdate({ ...state, status: { ...state.status, sent: true }});
}

function markReceived(state: SyncState): SyncState {
  return handleTurnStatusUpdate({ ...state, status: { ...state.status, received: true }});
}

function handleTurnStatusUpdate(state: SyncState): SyncState {
  if (state.status.sent && state.status.received) {
    return handleTurnUpdate({
      ...state,
      status: { sent: false, received: false },
      turn: {
        phase: state.turn.phase === 'reveal' ? 'setup' : 'reveal',
        num: state.turn.phase === 'reveal' ? state.turn.num + 1 : state.turn.num,
      }
    });
  } else {
    return state;
  }
}

function verifySaltedData(hash: string, saltedData: SaltedData) {
  if (crypto.hash(stringify(saltedData)) !== hash) {
    throw new Error('salted data could not be verified');
  }
}

function handleTurnUpdate(state: SyncState): SyncState {
  if (state.turn.phase === 'reveal' && state.data.move) {
    const data: MoveReveal = { key: 'reveal', turn: state.turn, move: state.data.move };
    return markSent(send(state, data));
  } else if (state.turn.phase === 'setup' && state.data.move && state.data.otherMove && state.data.otherHash ) {
    verifySaltedData(state.data.otherHash, state.data.otherMove);
    return {
      ...state,
      data: { move: null, otherMove: null, otherHash: null }, 
      todo: {
        ...state.todo,
        turns: [...state.todo.turns, {
          move: state.data.move.data, 
          otherMove: state.data.otherMove.data }
        ]
      }
    };
  } else {
    return state;
  }
}

function turnMatches(state: SyncState, turn: Turn): boolean {
  return state.turn.phase === turn.phase && state.turn.num === turn.num;
}

function onSetup(state: SyncState, data: MoveSetup): SyncState {
  if (!turnMatches(state, data.turn) || state.status.received) {
    return state;
  }
  return markReceived({ ...state, data: { ...state.data, otherHash: data.hash } });
}

function onReveal(state: SyncState, data: MoveReveal): SyncState {
  if (!turnMatches(state, data.turn) || state.status.received) {
    return state;
  }
  return markReceived({ ...state, data: { ...state.data, otherMove: data.move } });
}

