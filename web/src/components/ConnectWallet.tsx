import React, { useState } from "react";
import { wallet } from "../eth";
import "../styles/Instructions.css";

interface ConnectWalletProps {
  onConnected: () => void;
}

export default function ConnectWallet({ onConnected }: ConnectWalletProps) {
  const [errorMsg, setErrorMsg] = useState<undefined | string>();
  async function connect() {
    try {
      await wallet.connectWallet();
      setErrorMsg(undefined);
      onConnected();
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  }
  return (
    <div className="connect-wallet">
      {!wallet.isConnected() && (
        <>
          <Instructions />
          <button onClick={connect}>Connect Wallet</button>
        </>
      )}
      {wallet.isConnected() && <p>Connected</p>}
      {errorMsg && <p>Error: {errorMsg}</p>}
    </div>

    //wallet.hasEthereum()
  );
}

const Instructions = () => {
  return (
    <>
      <div className="heading"></div>
      <div className="instructions">
        <h1 className="instructions-title">New to Ethereum?</h1>
        <h2>
          1. Check out <a href="https://metamask.io/faqs">Metamask</a>
        </h2>
        <h2>
          2. Connect to{" "}
          <a href="https://medium.com/stakingbits/setting-up-metamask-for-polygon-matic-network-838058f6d844">
            Polygon Network
          </a>
        </h2>
        <h2>3. Hit the Connect Wallet button to play Super Card Game!</h2>
      </div>
    </>
  );
};
