import React from "react";
import Matchmaking from "./Matchmaking";
import "../styles/Play.css";
import playBackground from "../assets/playbackgroundfull.png";

export default function Play() {
  return (
    <>
      <img className="play-background" src={playBackground} alt="background" />
      <Matchmaking />
    </>
  );
}
