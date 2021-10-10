import { useState, useEffect } from 'react';

import { message, channel, sync } from '../comms';

export default function useSync(
  onMoves: (move: any, otherMove: any) => void,
  channel: channel.Channel,
  other: string,
): (move: any) => void {
  const [syncState, setSyncState] = useState(sync.baseState(other));

  useEffect(() => {
    return message.listen((msg) => {
      setSyncState(state => sync.handleMessage(state, msg));
    }, channel);
  }, []);

  useEffect(() => {
    if (syncState.todo.outgoing.length > 0) {
      syncState.todo.outgoing.forEach(data => {
        message.send(data, channel);
      });
      setSyncState(state => ({ ...state, todo: { ...state.todo, outgoing: [] }}));
    }
  }, [syncState.todo.outgoing]);


  useEffect(() => {
    if (syncState.todo.turns.length > 0) {
      syncState.todo.turns.forEach(turn => {
        onMoves(turn.move, turn.otherMove);
      });
      setSyncState(state => ({ ...state, todo: { ...state.todo, turns: [] } }));
    }
  }, [syncState.todo.turns]);

  function playMove(move: any): void {
    console.log('playMove');
    setSyncState(state => sync.playMove(state, move));
  }
  
  return playMove;
}
