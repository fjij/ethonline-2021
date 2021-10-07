import elliptic from 'elliptic';
import keccak256 from 'keccak256';

const EC = elliptic.ec;
const ec = new EC('ed25519');

const key = ec.genKeyPair();

export function b64encode(arr: number[]): string {
  return btoa(String.fromCharCode.apply(null, arr));
}

export function b64decode(str: string): number[] {
  return atob(str).split('').map(c => c.charCodeAt(0));
}

export function getPublicKey(): string {
  return key.getPublic().encode('hex', true);
}

export function randomBytes(len: number): number[] {
  const arr = new Uint8Array(len);
  window.crypto.getRandomValues(arr);
  return Array.from(arr);
}

export interface SignedMessage {
  signature: string;
  publicKey: string;
  message: string;
}

export function sign(message: string): SignedMessage {
  const hash = keccak256(message).toString('hex');
  const derHash = key.sign(hash).toDER();
  return {
    signature: b64encode(derHash),
    publicKey: key.getPublic().encode('hex', true),
    message,
  };
}

export function verify({ signature, publicKey, message }: SignedMessage): boolean {
  const hash = keccak256(message).toString('hex');
  const key = ec.keyFromPublic(publicKey, 'hex');
  return key.verify(hash, b64decode(signature));
}