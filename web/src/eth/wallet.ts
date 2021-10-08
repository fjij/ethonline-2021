import { ethers } from 'ethers';
import { message } from '../comms';
import * as contract from './contract';

let signer: ethers.providers.JsonRpcSigner;
let address: string;
let connected: boolean = false;

export function hasEthereum(): boolean {
  // @ts-ignore window.ethereum
  return !!window.ethereum;
}

export function isConnected(): boolean {
  return (!!signer) && (!!address) && connected;
}

export function getSigner(): ethers.providers.JsonRpcSigner {
  return signer;
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
      await ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(ethereum);

      signer = provider.getSigner();
      address = await signer.getAddress();

      // Initialize friends
      await contract.init(signer);
      await message.init(signer);

      connected = true;
    } catch(e) {
      console.error('Wallet not connected.');
      console.error(e);
    }
  }
}
