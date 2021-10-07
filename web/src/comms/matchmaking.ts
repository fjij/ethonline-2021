import { wallet } from '../eth';
import * as message from './message';
import * as channel from './channel';

interface StateNone {
  key: 'none'
};

interface StateSearching {
  key: 'searching';
};

interface StateNegotiating {
  key: 'negotiating';
  other: string;
};

interface StateFound {
  key: 'found';
  other: string;
};

export type State = StateNone
  | StateSearching
  | StateNegotiating
  | StateFound;

export type StateKey = 'none' | 'searching' | 'negotiating' | 'found';

export function sendMatchPosting() {
  message.send({
    key: 'posting'
  }, channel.matchmaking);
}

type MatchData = MatchPosting | MatchResponse | MatchAccept;

interface MatchPosting {
  key: 'posting';
}

interface MatchResponse {
  key: 'response';
  other: string;
}

interface MatchAccept {
  key: 'accept';
  other: string;
}

export function handleMessage(state: State, msg: message.Message): State {
  const data: MatchData = msg.data;

  switch (data.key) {
    case 'posting':
    {
      requestMatch(msg);
      return { key: 'negotiating', other: msg.sender };
    }
    case 'response':
    {
      if (state.key === 'searching'
        || (state.key === 'negotiating' && state.other === data.other)
      ) {
        if (data.other === wallet.getAddress()) {
          acceptResponse(msg);
          return { key: 'found', other: msg.sender };
        }
      }
      return state;
    }
    case 'accept':
    {
      if (state.key === 'negotiating') {
        if (data.other === wallet.getAddress()) {
          return { key: 'found', other: msg.getSender() };
        }
      }
      return state;
    }
  }
}

function requestMatch(msg: message.Message) {
  message.send({
    other: msg.getSender(),
    key: 'response'
  }, channel.matchmaking);
}

function acceptResponse(msg: message.Message) {
  message.send({
    poster: msg.getSender(),
    key: 'response'
  }, channel.matchmaking);
}
