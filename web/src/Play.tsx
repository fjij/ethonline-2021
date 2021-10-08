import React from 'react';
import Matchmaking from './Matchmaking';
import ConnectWallet from './ConnectWallet';


export default function Play() {
    return (
        <>
        <h1>Play</h1>
        <ConnectWallet/>
        <Matchmaking/>
        </>
    )
}