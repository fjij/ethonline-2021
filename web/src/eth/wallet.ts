import { ethers } from 'ethers';
import { message } from '../comms';

let signer: null | ethers.providers.JsonRpcSigner = null;

export function hasEthereum(): boolean {
  // @ts-ignore window.ethereum
  return !!window.ethereum;
}

export function isConnected(): boolean {
  return !!signer;
}

export async function connectWallet() {
  // @ts-ignore window.ethereum
  const ethereum = window.ethereum;
  if (ethereum) {
    try {
      await ethereum.enable();
      const provider = new ethers.providers.Web3Provider(ethereum);
      signer = provider.getSigner();
      const publicKey = message.getPublicKey();
      const signature = await requestSignature(message.getPublicKeyString(publicKey));
      if (signature) {
        message.submitSignature(signature);
      }
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
