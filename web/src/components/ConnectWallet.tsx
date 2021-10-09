import React, { useState } from 'react';
import { wallet } from '../eth';

interface ConnectWalletProps {
  onConnected: () => void,
}

export default function ConnectWallet({
  onConnected,
}: ConnectWalletProps) {
  const [errorMsg, setErrorMsg] = useState<undefined | string>();
  async function connect() {
    try {
      await wallet.connectWallet();
      setErrorMsg(undefined);
      onConnected();
    } catch(e: any) {
      setErrorMsg(e.message);
    }
  }
  return (
    <div className="connect-wallet">
      { !wallet.isConnected() && <button onClick={connect}>Connect Wallet</button> }
      { wallet.isConnected() && <p>Connected</p> }
      { errorMsg && <p>Error: {errorMsg}</p> }
    </div>
  );
}
