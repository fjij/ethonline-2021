import { Waku, WakuMessage } from 'js-waku';
import * as channel from './channel';
const cryptoRandomString = require('crypto-random-string');

const NONCE_LENGTH = 32;

let waku: Waku;

async function assertWaku() {
  if (!waku) {
    waku = await Waku.create({ bootstrap: true });
    console.log('connected to waku');
  }
}

export class Message {
  data: object;
  nonce: string;

  constructor(data: object, nonce?: string) {
    this.data = data;
    this.nonce = nonce ?? cryptoRandomString(NONCE_LENGTH);
  }

  toString() {
    return JSON.stringify({
      data: this.data,
      nonce: this.nonce,
    });
  }

  getData() {
    return this.data;
  }

  getNonce() {
    return this.nonce;
  }

  static fromString(str: string): Message {
    const { data, nonce } = JSON.parse(str);
    return new Message(data, nonce);
  }
}

interface ListenOpts {
  filterSeen?: boolean
}

export async function listen(
  callback: (msg: Message) => void,
  channel: channel.Channel,
  opts?: ListenOpts
) {
  const contentTopic = channel.getContentTopic();
  await assertWaku();
  let seen: { [key: string]: boolean } = {};
  waku.relay.addObserver((wakuMsg) => {
    const msg = Message.fromString(wakuMsg.payloadAsUtf8);
    if (opts?.filterSeen) {
      if (!seen[msg.getNonce()]) {
        callback(msg);
        seen[msg.getNonce()] = true;
      }
    } else {
      callback(msg);
    }
  }, [contentTopic]);
}

export async function send(msg: Message, channel: channel.Channel) {
  const contentTopic = channel.getContentTopic();
  await assertWaku();
  const wakuMsg = await WakuMessage.fromUtf8String(msg.toString(), contentTopic);
  await waku.relay.send(wakuMsg);
}
