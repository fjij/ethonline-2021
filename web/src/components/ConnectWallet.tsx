import React, { useState } from 'react';
import { wallet } from '../eth';

interface ConnectWalletProps {
  onConnected: () => void,
}

export default function ConnectWallet({
  onConnected,
}: ConnectWalletProps) {
  const [isConnected, setConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState<undefined | string>();
  async function connect() {
    try {
      await wallet.connectWallet();
      onConnected();
      setConnected(true);
      setErrorMsg(undefined);
    } catch(e: any) {
      setErrorMsg(e.message);
    }
  }
  return (
    <div className="connect-wallet">
      { !isConnected && <button onClick={connect}>Connect Wallet</button> }
      { isConnected && <p>Connected</p> }
      { errorMsg && <p>Error: {errorMsg}</p> }
    </div>
  );
}
