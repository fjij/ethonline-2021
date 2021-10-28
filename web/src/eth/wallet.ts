import { ethers } from "ethers";
import { message } from "../comms";
import * as contract from "./contract";
import deployment from "../contracts/deployment.json";

let signer: ethers.providers.JsonRpcSigner;
let address: string;
let connected: boolean = false;

export function hasEthereum(): boolean {
  // @ts-ignore window.ethereum
  return !!window.ethereum;
}

export function isConnected(): boolean {
  return !!signer && !!address && connected;
}

export function getSigner(): ethers.providers.JsonRpcSigner {
  return signer;
}

export function getAddress(): string {
  if (!signer) {
    throw new Error("no signer connected");
  }
  return address;
}

export async function requestAddAndSwitchChain(ethereum: any) {
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: `0x${deployment.chainId.toString(16)}`,
        },
      ],
    });
  } catch (err: any) {
    // Chain not added to metamask
    if (err.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${deployment.chainId.toString(16)}`,
            chainName: deployment.name,
            rpcUrls: [deployment.url],
          },
        ],
      });
    }
  }
}

export async function connectWallet() {
  // @ts-ignore window.ethereum
  const ethereum = window.ethereum;
  if (ethereum) {
    try {
      await requestAddAndSwitchChain(ethereum);

      await ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(ethereum);
      signer = provider.getSigner();
      address = await signer.getAddress();

      // Initialize friends
      await contract.init(signer);
      await message.init(signer);

      connected = true;
    } catch (e) {
      throw e;
    }
  } else {
    throw new Error("Metamask not detected.");
  }
}
