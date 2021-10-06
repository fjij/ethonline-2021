// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre, { ethers } from 'hardhat';
import CardLocation from '../cards/location.json';
import fs from 'fs-extra';
import path from 'path';

async function main() {
  const { metadata, count } = CardLocation;

  const Cards = await ethers.getContractFactory('Cards');
  const cards = await Cards.deploy(`ipfs://${metadata}/{id}.json`, count);

  await cards.deployed();

  console.log('Cards deployed to:', cards.address);

  const deploymentDir = path.join(__dirname, `../deployments/${hre.network.name}`);
  await fs.mkdirp(deploymentDir);
  fs.writeFileSync(path.join(deploymentDir, 'deployment.json'), JSON.stringify({
    address: cards.address,
    chainId: hre.network.config.chainId,
    url: (hre.network.config as any).url,
  }, null, 2));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
