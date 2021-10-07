import { wallet } from '../eth';
import * as message from './message';
import * as channel from './channel';

export function sendMatchPosting() {
  message.send({
    key: 'posting'
  }, channel.matchmaking);
}

interface Match {
  other: string;
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

export function handleMessage(msg: message.Message): Match | null {
  const data: MatchData = msg.data;

  switch (data.key) {
    case 'posting':
    {
      requestMatch(msg);
      return null;
    }
    case 'response':
    {
      if (data.other === wallet.getAddress()) {
        acceptResponse(msg);
        return { other: msg.sender };
      }
      return null;
    }
    case 'accept':
    {
      if (data.other === wallet.getAddress()) {
        return { other: msg.sender };
      }
      return null;
    }
  }
}

function requestMatch(msg: message.Message) {
  message.send({
    other: msg.sender,
    key: 'response'
  }, channel.matchmaking);
}

function acceptResponse(msg: message.Message) {
  message.send({
    poster: msg.sender,
    key: 'response'
  }, channel.matchmaking);
}
