import React, { useState } from "react";
import "../styles/Game.css";
import { motion } from "framer-motion";

export default function Game() {
  const [attack, setAttack] = useState({ x: 0, opacity: 100 });
  const [shake, setShake] = useState({
    scale: [1],
    rotate: [0],
    borderRadius: ["0%"],
  });

  return (
    <>
      <button
        onClick={() => {
          setAttack({ x: 100, opacity: 0 });
          setTimeout(() => {
            setAttack({ x: 0, opacity: 0 });
          }, 1000);
        }}
      >
        Left Attack
      </button>

      <button
        onClick={() => {
          setShake({
            scale: [1, 2, 2, 1, 1],
            rotate: [0, 0, 270, 270, 0],
            borderRadius: ["20%", "20%", "50%", "50%", "20%"],
          });
          setTimeout(() => {
            setShake({
              scale: [1],
              rotate: [0],
              borderRadius: ["0%"],
            });
          }, 5000);
        }}
      >
        Shake
      </button>

      <div className="layout">
        <div className="player2">
          <div className="player2used">
            <div className="player2discard">
              <motion.div
                className="box"
                animate={{
                  scale: [1, 2, 2, 1, 1],
                  rotate: [0, 90, 180, 270, 360],
                }}
                transition={{ duration: 1 }}
              ></motion.div>
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
            <motion.div
              className="box-play"
              animate={{ x: attack.x }}
            ></motion.div>
          </div>
          <div className="right-player">
            <motion.div
              className="box-play"
              animate={{ opacity: attack.opacity }}
              transition={{ duration: 2 }}
            ></motion.div>
          </div>
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
