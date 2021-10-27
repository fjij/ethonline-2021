import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Card from "./Card";
import { interactions, board } from "../game";
import themeDecks from "../game/theme-decks";
import useGameState from "../hooks/useGameState";

import "../styles/Game.css";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function PlayerStatus({
  state,
  name,
}: {
  state: board.PlayerState;
  name: string;
}) {
  let texts = [
    `Deck: ${state.deck.length}`,
    `Hand: ${state.hand.length}`,
    `Heroes: ${state.heroes.length}`,
    `Points: ${state.points}`,
  ];
  if (state.empower) {
    texts.push(interactions.keywordToText(state.empower));
  }
  return (
    <div className="player-status">
      <h3>{name}</h3>
      {state.winner ? (
        <h2>Winner!</h2>
      ) : (
        texts.map((text, idx) => <p key={idx}>{text}</p>)
      )}
    </div>
  );
}

interface DelayedCard {
  card: board.FaceUpCardState;
  destroyed: boolean;
}

function useDelayedHand(
  source: board.CardState[] | undefined,
  destroyDelay: number
): DelayedCard[] {
  const [hand, setHand] = useState<DelayedCard[]>([]);

  useEffect(() => {
    if (source) {
      const newHand = [...hand];
      const myHashes = hand.map((item) => item.card.hash);
      const hashes = source.map((item) => item.hash);
      myHashes.forEach((myHash, idx) => {
        if (hashes.indexOf(myHash) === -1) {
          newHand[idx].destroyed = true;
          setTimeout(
            () =>
              setHand((hand) =>
                hand.filter((item) => item.card.hash !== myHash)
              ),
            destroyDelay
          );
        }
      });
      hashes.forEach((hash, idx) => {
        if (myHashes.indexOf(hash) === -1) {
          newHand.push({
            card: source[idx] as board.FaceUpCardState,
            destroyed: false,
          });
        }
      });
      setHand(newHand);
    }
    // eslint-disable-next-line
  }, [source]);

  return hand;
}

export default function Game() {
  const { other }: any = useParams();

  const [selectedCard, setSelectedCard] = useState<
    board.FaceUpCardState | undefined
  >();
  const [boardState, setupDeck, playCard, canMove] = useGameState(
    other,
    onUpdate
  );

  const hand = useDelayedHand(boardState.playerState?.hand, 500);
  const heroes = useDelayedHand(boardState.playerState?.heroes, 500);

  const [logs, setLogs] = useState<string[]>([]);
  const [otherLogs, setOtherLogs] = useState<string[]>([]);

  function play() {
    if (selectedCard) {
      playCard(selectedCard);
    }
  }

  function displayMessage(isOther: boolean, message: string) {
    if (isOther) {
      setOtherLogs((otherLogs) => [...otherLogs, message]);
    } else {
      setLogs((logs) => [...logs, message]);
    }
  }

  function clearMessages() {
    setOtherLogs([]);
    setLogs([]);
  }

  async function onUpdate(): Promise<void> {
    switch (boardState.nextPhase) {
      case "play": {
        clearMessages();
        return;
      }
      case "combat": {
        const empower = boardState.playerState?.empower;
        if (empower) {
          displayMessage(false, interactions.keywordToText(empower));
          await sleep(2000);
        }
        const otherEmpower = boardState.otherPlayerState?.empower;
        if (otherEmpower) {
          displayMessage(true, interactions.keywordToText(otherEmpower));
          await sleep(2000);
        }
        return;
      }
      case "resolution": {
        const firstEffect = boardState.combatResult?.keywords[0];
        if (firstEffect) {
          displayMessage(
            firstEffect.isOther,
            interactions.keywordToTextPlus(firstEffect.result)
          );
        }
        await sleep(2000);
        return;
      }
      case "bonus": {
        if (boardState.combatResult?.won) {
          displayMessage(false, "Won!");
        } else {
          displayMessage(false, "Lost...");
        }
        await sleep(2000);
        if (boardState.combatResult?.otherWon) {
          displayMessage(true, "Won!");
        } else {
          displayMessage(true, "Lost...");
        }
        await sleep(2000);
        if (boardState.combatResult?.won) {
          if (boardState.playerState?.active?.isHero) {
            displayMessage(false, "+1 Point.");
          } else {
            displayMessage(false, "Draw Hero.");
          }
        }
        await sleep(2000);
        if (boardState.combatResult?.otherWon) {
          if (boardState.otherPlayerState?.active?.isHero) {
            displayMessage(true, "+1 Point.");
          } else {
            displayMessage(true, "Draw Hero.");
          }
        }
        await sleep(2000);
        return;
      }
      case "draw": {
        await sleep(1000);
        if (boardState.playerState!.hand.length < 4) {
          displayMessage(false, "Draw 1.");
          await sleep(2000);
        }
        if (boardState.playerState!.hand.length < 4) {
          displayMessage(true, "Draw 1.");
          await sleep(2000);
        }
        return;
      }
    }
  }

  return (
    <div className="game">
      {!boardState.playerState && (
        <div>
          <h1>Theme Decks</h1>
          <br />
          {themeDecks.map((themeDeck) => (
            <div className="theme-deck" key={themeDeck.name}>
              <h2>{themeDeck.name}</h2>
              <p>{themeDeck.description}</p>
              <br />
              <Card id={themeDeck.cover} disabled />
              <br />
              <button onClick={() => setupDeck(themeDeck.deck)}>
                Play Deck
              </button>
            </div>
          ))}
        </div>
      )}
      {boardState.playerState && !boardState.otherPlayerState && (
        <div>Waiting for other player to choose deck...</div>
      )}
      {boardState.playerState && boardState.otherPlayerState && (
        <div className="board">
          <div className="game-arena">
            <h1>Battle</h1>
            <div className="game-arena-flex">
              <PlayerStatus state={boardState.playerState} name="Me" />
              <div className="game-card-slot-hard">
                {boardState.playerState.active && (
                  <Card
                    id={boardState.playerState.active.card.data.id}
                    disabled
                  />
                )}
                {logs.map((text) => (
                  <h2 className="game-card-message" key={text}>
                    {text}
                  </h2>
                ))}
              </div>
              <h2 className="game-vs"> vs </h2>
              <div className="game-card-slot-hard">
                {boardState.otherPlayerState.active && (
                  <Card
                    id={boardState.otherPlayerState.active.card.data.id}
                    disabled
                  />
                )}
                {otherLogs.map((text) => (
                  <h2 className="game-card-message" key={text}>
                    {text}
                  </h2>
                ))}
              </div>
              <PlayerStatus
                state={boardState.otherPlayerState}
                name="Opponent"
              />
            </div>
          </div>
          <br />
          <div>
            <h2>Choose a card</h2>
            <div className="game-hand">
              {hand.map(({ card, destroyed }) => (
                <div
                  key={card.hash}
                  className={"game-card-slot" + (destroyed ? " destroyed" : "")}
                >
                  <Card
                    onClick={() => setSelectedCard(card)}
                    id={card.data.id}
                    key={card.hash}
                    disabled={!canMove || destroyed}
                    selected={selectedCard?.hash === card.hash}
                  />
                </div>
              ))}
              {boardState.playerState.heroes.length > 0 && (
                <div className="game-hero-divider" />
              )}
              {heroes.map(({ card, destroyed }) => (
                <div
                  key={card.hash}
                  className={"game-card-slot" + (destroyed ? " destroyed" : "")}
                >
                  <Card
                    onClick={() => setSelectedCard(card)}
                    id={card.data.id}
                    disabled={!canMove || destroyed}
                    hero
                    selected={selectedCard?.hash === card.hash}
                  />
                </div>
              ))}
            </div>
            <div className="game-bottom">
              <button onClick={play} disabled={!canMove || !selectedCard}>
                Lock In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
