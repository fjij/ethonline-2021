import { contract, ipfs } from '../eth';
import { interactions } from '../game';

export interface CardData {
  name: string;
  description: string;
  image: string;
  power: number;
  keywords: interactions.Keyword[];
}

export async function getCardData(id: number): Promise<CardData> {
  const uri = await contract.getUri(id);
  return await ipfs.getData(uri);
}

