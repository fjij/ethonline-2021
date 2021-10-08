import { Waku, WakuMessage, getBootstrapNodes } from 'js-waku';
import { ethers } from 'ethers';

import { wallet } from '../eth';
import * as channel from './channel';
import * as crypto from './crypto';

const NONCE_BYTES = 24;
const MESSAGE_LIFETIME = 30*1000;

let waku: Waku;
const sent: { [key: string]: boolean } = {};
let walletSignature: string;

export async function init(signer: ethers.providers.JsonRpcSigner) {
  walletSignature = (await signer.signMessage(crypto.getPublicKey())).toString();
  waku = await Waku.create({
    bootstrap: getBootstrapNodes.bind({}, ['fleets', 'wakuv2.test', 'waku-websocket'])
  });
  console.log('connected to waku');
}

function assertWaku() {
  if (!waku) {
    throw new Error('not connected to waku');
  }
}

interface MessageMetadata {
  timestamp: number;
  expiry: number;
  nonce: string;
  signature: string;
}

export class Message {
  data: any;
  sender: string;
  metadata: MessageMetadata;

  constructor(data: any, sender: string, signature: string, metadata?: MessageMetadata) {
    this.data = data;
    this.sender = sender;
    this.metadata = metadata ?? {
      timestamp: Date.now(),
      nonce: crypto.b64encode(crypto.randomBytes(NONCE_BYTES)),
      signature,
      expiry: Date.now() + MESSAGE_LIFETIME
    };
  }

  toString() {
    return JSON.stringify({
      data: this.data,
      sender: this.sender,
      metadata: this.metadata,
    });
  }

  getData() {
    return this.data;
  }

  getSender() {
    return this.sender;
  }

  getNonce() {
    return this.metadata.nonce;
  }

  getTimestamp() {
    return this.metadata.timestamp
  }

  isExpired() {
    return !this.metadata.expiry || Date.now() > this.metadata.expiry;
  }

  getSignature() {
    return this.metadata.signature;
  }

  verify(publicKey: string) {
    return this.sender === ethers.utils.verifyMessage(publicKey, this.getSignature());
  }

  static fromString(str: string): Message {
    const { data, sender, metadata } = JSON.parse(str);
    return new Message(data, sender, metadata.signature, metadata);
  }
}

export function listen(
  callback: (msg: Message) => void,
  channel: channel.Channel
): () => void {
  assertWaku();
  const contentTopic = channel.getContentTopic();
  const seen: { [key: string]: boolean } = {};
  const listener = (wakuMsg: WakuMessage) => {
    const signedMsg: crypto.SignedMessage = JSON.parse(wakuMsg.payloadAsUtf8);
    if (crypto.verify(signedMsg)) {
      const msg = Message.fromString(signedMsg.message);
      if (msg.verify(signedMsg.publicKey) && !msg.isExpired()) {
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

export async function send(data: any, channel: channel.Channel) {
  assertWaku();
  const msg = new Message(data, wallet.getAddress(), walletSignature);
  const signedMsg = crypto.sign(msg.toString());
  const contentTopic = channel.getContentTopic();
  const wakuMsg = await WakuMessage.fromUtf8String(JSON.stringify(signedMsg), contentTopic);
  sent[msg.getNonce()] = true;
  await waku.relay.send(wakuMsg);
}
