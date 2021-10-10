import { ethers } from "ethers";
import CardsArtifact from "../contracts/Cards.json";
import deployment from "../contracts/deployment.json";

let contract: ethers.Contract;
let baseUri: string | null = null;

export async function init(signer: ethers.providers.JsonRpcSigner) {
  contract = new ethers.Contract(deployment.address, CardsArtifact.abi, signer);
}

export async function getUri(id: number): Promise<string> {
  if (!baseUri) {
    const uri: string = await contract.uri(0);
    baseUri = uri;
  }
  return baseUri.replace("{id}", `${id}`);
}

export async function balanceOf(address: string, id: number): Promise<number> {
  return (await contract.balanceOf(address, id)).toNumber();
}

export async function getCount(): Promise<number> {
  return (await contract.count()).toNumber();
}

export async function balanceOfBatch(
  address: string,
  ids: number[]
): Promise<number[]> {
  return (
    await contract.balanceOfBatch(Array(ids.length).fill(address), ids)
  ).map((x: ethers.BigNumber) => x.toNumber());
}

export async function mint(id: number): Promise<void> {
  await contract.mint(id);
}

export async function mintBatch(
  ids: number[],
  amounts: number[]
): Promise<void> {
  await contract.mintBatch(ids, amounts);
}

export async function burn(id: number): Promise<void> {
  await contract.burn(id);
}

export async function burnBatch(
  ids: number[],
  amounts: number[]
): Promise<void> {
  await contract.burnBatch(ids, amounts);
}
