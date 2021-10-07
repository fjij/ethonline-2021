import React, { useState } from 'react';
import { wallet } from './eth';

export default function ConnectWallet() {
  const [isConnected, setConnected] = useState(false);
  async function connect() {
    await wallet.connectWallet();
    setConnected(wallet.isConnected());
  }
  return (
    <div className="connect-wallet">
      { isConnected ?
        <p>Connected</p> :
        <button onClick={connect}>Connect Wallet</button>
      }
    </div>
  );
}
