import React, { useState } from "react";
import { wallet } from "../eth";
import "../styles/Instructions.css";
import deployment from "../contracts/deployment.json";

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
          1. Get <a href="https://metamask.io/faqs">Metamask.</a>
        </h2>
        <h2>
          2. Connect to{" "}
          <a href="https://mumbai.polygonscan.com/">Mumbai Polygon Testnet.</a>
        </h2>
        <div>
          <code>chain id: {deployment.chainId}</code>
          <br />
          <code>rpc: {deployment.url}</code>
        </div>
        <h2>3. Click the Connect Wallet button.</h2>
        <h2>4. Play Super Card Game!</h2>
        <p>
          Warning: If you continue without metamask connected to the correct
          network, the rest of the site might not work as intended.
        </p>
      </div>
    </>
  );
};
