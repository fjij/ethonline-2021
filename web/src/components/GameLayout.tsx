import React from "react";
import "../styles/GameLayout.css";
import { board } from "../game";

interface GameLayoutProps {}

export default function GameLayout({}) {
  return (
    <>
      <div className="layout">
        <div className="player2">
          <div className="player2used">
            <div className="player2discard">
              <div className="box"></div>
            </div>
            <div className="box"></div>
          </div>
          <div className="player2hand">
            <div className="player2bench">
              <div className="box"></div>
              <div className="box"></div>
              <div className="box"></div>
              <div className="box"></div>
              <div className="player2back">
                <div className="box"></div>
              </div>
            </div>
          </div>
          <div className="player2deck">
            <div className="box"></div>
          </div>
        </div>
        <div className="player-play">
          <div className="left-player">
            <div className="box-play"></div>
          </div>
          <div className="box-play"></div>
        </div>
        <div className="player2">
          <div className="player2used">
            <div className="player2discard">
              <div className="box"></div>
            </div>
            <div className="box"></div>
          </div>
          <div className="player2hand">
            <div className="player2bench">
              <div className="box"></div>
              <div className="box"></div>
              <div className="box"></div>
              <div className="box"></div>
              <div className="player2back">
                <div className="box"></div>
              </div>
            </div>
          </div>
          <div className="player2deck">
            <div className="box"></div>
          </div>
        </div>
      </div>
    </>
  );
}
