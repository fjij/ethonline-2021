// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { NFTStorage, File } from 'nft.storage';
import fs from 'fs-extra';
import path from 'path';

const apiKey = process.env.NFT_STORAGE_API_KEY;
if (!apiKey) {
  throw new Error('Missing environment variable NFT_STORAGE_API_KEY');
}
const client = new NFTStorage({ token: apiKey });

function readDirectory(dir: string): File[] {
  const names = fs.readdirSync(dir);
  return names.map(name => 
    new File([fs.readFileSync(path.join(dir, name)) as BlobPart], name));
}

async function uploadCards(): Promise<[string, number]> {
  const images = readDirectory(path.join(__dirname, '../cards/images'));
  const imageMetadata = await client.storeDirectory(images);
  console.log("Images uploaded to: ", imageMetadata);
  const cardFiles = readDirectory(path.join(__dirname, '../cards/data'));
  const cardFilesModified = await Promise.all(cardFiles.map(async file => {
    const obj = JSON.parse(await file.text());
    obj.image = `ipfs://${imageMetadata.toString()}/${obj.image}`;
    return new File([JSON.stringify(obj)], file.name);
  }));
  const fileMetadata = await client.storeDirectory(cardFilesModified);
  console.log("Files uploaded to: ", fileMetadata);
  return [fileMetadata.toString(), cardFiles.length];
}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  
  const [hash, cardCount] = await uploadCards();

  const Cards = await ethers.getContractFactory("Cards");
  const cards = await Cards.deploy(`ipfs://${hash}/{id}.json`, cardCount);

  await cards.deployed();

  console.log("Cards deployed to:", cards.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
