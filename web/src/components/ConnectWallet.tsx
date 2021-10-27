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
      <div className="heading"></div>
      {!wallet.isConnected() && (
        <>
          <h1>New to Ethereum?</h1>
          <h2>
            Get <a href="https://metamask.io/">Metamask.</a>
          </h2>
          <br />
          <button onClick={connect}>Connect Wallet</button>
        </>
      )}
      {wallet.isConnected() && <p>Connected</p>}
      <br />
      <br />
      {errorMsg && <p>{errorMsg}</p>}
    </div>
  );
}
