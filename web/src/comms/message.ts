import {
  Waku,
  WakuMessage,
  generatePrivateKey,
  getPublicKey as getPublicKeyFromPrivateKey,
} from 'js-waku';
import { ethers } from 'ethers';
import * as channel from './channel';

const cryptoRandomString = require('crypto-random-string');
const base64 = require('base-64');

const symKey = base64.decode("MTM2LDIzMywyNTEsNDMsMSwxNjUsNTUsODEsMjIsMzQsMTEzLDIwOCwxNDMsMTE1LDg4LDE1Nyw1OSwyNTEsMjQxLDk1LDE2MiwxOTMsMjEzLDE4NSwxOTEsNDMsMjQsMTUyLDExNSw5NCw1Miw5OQ==");

const NONCE_LENGTH = 32;
const KEY_NAME = 'super-card-game-session-key';

let waku: Waku;
const sent: { [key: string]: boolean } = {};

const privateKey = generatePrivateKey();
const publicKey = getPublicKeyFromPrivateKey(privateKey);
let signature: null | string = null;

export function getPublicKey(): Uint8Array {
  return publicKey;
}

export function getPublicKeyString(publicKey: Uint8Array): string {
  return `${KEY_NAME}: ${base64.encode(publicKey)}`;
}

export function submitSignature(sig: string) {
  signature = sig;
}

export function hasSignature(): boolean {
  return !!signature;
}

async function assertWaku() {
  if (!waku) {
    waku = await Waku.create({ bootstrap: true });
    waku.relay.addDecryptionKey(symKey);
    console.log('connected to waku');
  }
}

export class Message {
  data: object;
  signature: string;
  nonce: string;
  sender: string | null = null;

  constructor(data: object, signature: string, nonce?: string) {
    this.data = data;
    this.signature = signature;
    this.nonce = nonce ?? cryptoRandomString(NONCE_LENGTH);
  }

  toString() {
    return JSON.stringify({
      data: this.data,
      nonce: this.nonce,
      signature
    });
  }

  getData() {
    return this.data;
  }

  getNonce() {
    return this.nonce;
  }

  getSignature() {
    return this.signature;
  }

  verify(publicKey: Uint8Array) {
    const str = getPublicKeyString(publicKey);
    this.sender = ethers.utils.verifyMessage(str, this.signature);
  }

  static fromString(str: string): Message {
    const { data, nonce } = JSON.parse(str);
    return new Message(data, nonce);
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
    const otherPublicKey = wakuMsg.signaturePublicKey;
    if (otherPublicKey) {
      const msg = Message.fromString(wakuMsg.payloadAsUtf8);
      try {
        msg.verify(otherPublicKey);
        if (!seen[msg.getNonce()] && !sent[msg.getNonce()]) {
          callback(msg);
          seen[msg.getNonce()] = true;
        }
      } catch {}
    }
  };
  waku.relay.addObserver(listener, [contentTopic]);
  return () => waku.relay.deleteObserver(listener, [contentTopic]);
}

export async function send(data: object, channel: channel.Channel) {
  if (signature) {
    const msg = new Message(data, signature);
    const contentTopic = channel.getContentTopic();
    await assertWaku();
    const wakuMsg = await WakuMessage.fromUtf8String(msg.toString(), contentTopic, {
      encPublicKey: symKey,
      sigPrivKey: privateKey,
    });
    sent[msg.getNonce()] = true;
    await waku.relay.send(wakuMsg);
  } else {
    throw new Error('not signed');
  }
}
