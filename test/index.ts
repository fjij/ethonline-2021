import { expect } from "chai";
import { ethers } from "hardhat";

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});

describe("Cards", () => {
  it("Should mint and burn cards", async () => {
    const [owner] = await ethers.getSigners()

    const Cards = await ethers.getContractFactory('Cards');
    const cards = await Cards.deploy('uri', 2);
    await cards.deployed();

    expect(await cards.balanceOf(await owner.getAddress(), 0)).to.equal(0);

    await cards.mint(0);

    expect(await cards.balanceOf(await owner.getAddress(), 0)).to.equal(1);

    await cards.burn(0);

    expect(await cards.balanceOf(await owner.getAddress(), 0)).to.equal(0);
  });

  it("Should fail to mint non-existent cards", async () => {
    const Cards = await ethers.getContractFactory('Cards');
    const cards = await Cards.deploy('uri', 2);
    await cards.deployed();

    await expect(cards.mint(3)).to.be.revertedWith('Card does not exist');
  });
});
