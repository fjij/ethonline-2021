import { Waku, WakuMessage } from 'js-waku';

let waku: Waku;

async function assertWaku() {
  if (!waku) {
    waku = await Waku.create({ bootstrap: true });
  }
}

export async function addObserver(callback: (msg: string) => void, contentTopic: string) {
  await assertWaku();
  waku.relay.addObserver((msg) => callback(msg.payloadAsUtf8), [contentTopic]);
}

export async function sendMessage(msg: string, contentTopic: string) {
  await assertWaku();
  const wakuMsg = await WakuMessage.fromUtf8String(msg, contentTopic)
  const ack = await waku.lightPush.push(wakuMsg);
  if (!ack?.isSuccess) {
    throw new Error('message not sent');
  }
}
