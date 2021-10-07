import { ethers } from 'ethers';
import { message, crypto } from '../comms';

let signer: null | ethers.providers.JsonRpcSigner = null;
let address: string;

export function hasEthereum(): boolean {
  // @ts-ignore window.ethereum
  return !!window.ethereum;
}

export function isConnected(): boolean {
  return !!signer;
}

export function getAddress(): string {
  if (!signer) {
    throw new Error('no signer connected');
  }
  return address;
}

export async function connectWallet() {
  // @ts-ignore window.ethereum
  const ethereum = window.ethereum;
  if (ethereum) {
    try {
      await ethereum.enable();
      const provider = new ethers.providers.Web3Provider(ethereum);
      signer = provider.getSigner();
      address = await signer.getAddress();
      const signature = await requestSignature(crypto.getPublicKey());
      message.setWalletSignature(signature);
    } catch {
      console.error('Wallet not connected.');
    }
  }
}

export async function requestSignature(text: string): Promise<string | null> {
  if (signer) {
    try {
      const sig = await signer.signMessage(text);
      return sig.toString();
    } catch {
      return null;
    }
  }
  return null;
}
