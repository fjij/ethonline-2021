import { Waku, WakuMessage } from 'js-waku';
import { ethers } from 'ethers';

import { wallet } from '../eth';
import * as channel from './channel';
import * as crypto from './crypto';

const NONCE_BYTES = 24;

let waku: Waku;
const sent: { [key: string]: boolean } = {};
let walletSignature: null | string = null;

export async function setWalletSignature(signature: string | null) {
  walletSignature = signature;
}

async function assertWaku() {
  if (!waku) {
    waku = await Waku.create({ bootstrap: true });
    console.log('connected to waku');
  }
}

export class Message {
  data: object;
  sender: string;
  signature: string;
  nonce: string;

  constructor(data: object, sender: string, signature: string, nonce?: string) {
    this.data = data;
    this.sender = sender;
    this.signature = signature;
    this.nonce = nonce ?? crypto.b64encode(crypto.randomBytes(NONCE_BYTES));
  }

  toString() {
    return JSON.stringify({
      data: this.data,
      signature: this.signature,
      nonce: this.nonce,
      sender: this.sender,
    });
  }

  getData() {
    return this.data;
  }

  getSender() {
    return this.sender;
  }

  getNonce() {
    return this.nonce;
  }

  getSignature() {
    return this.signature;
  }

  verify(publicKey: string) {
    return this.sender === ethers.utils.verifyMessage(publicKey, this.signature);
  }

  static fromString(str: string): Message {
    const { data, nonce, signature, sender } = JSON.parse(str);
    return new Message(data, sender, signature, nonce);
  }
}

export async function listen(
  callback: (msg: Message) => void,
  channel: channel.Channel
): Promise<() => void> {
  const contentTopic = channel.getContentTopic();
  await assertWaku();
  const seen: { [key: string]: boolean } = {};
  const listener = (wakuMsg: WakuMessage) => {
    const signedMsg: crypto.SignedMessage = JSON.parse(wakuMsg.payloadAsUtf8);
    if (crypto.verify(signedMsg)) {
      const msg = Message.fromString(signedMsg.message);
      if (msg.verify(signedMsg.publicKey)) {
        if (!seen[msg.getNonce()] && !sent[msg.getNonce()]) {
          callback(msg);
          seen[msg.getNonce()] = true;
        }
      }
    }
  };
  waku.relay.addObserver(listener, [contentTopic]);
  return () => waku.relay.deleteObserver(listener, [contentTopic]);
}

export async function send(data: object, channel: channel.Channel) {
  if (!walletSignature) {
    throw new Error('no signature');
  }
  const msg = new Message(data, wallet.getAddress(), walletSignature);
  const signedMsg = crypto.sign(msg.toString());
  const contentTopic = channel.getContentTopic();
  await assertWaku();
  const wakuMsg = await WakuMessage.fromUtf8String(JSON.stringify(signedMsg), contentTopic);
  sent[msg.getNonce()] = true;
  await waku.relay.send(wakuMsg);
}
