import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  const [animate, setAnimate] = useState("#000000");
  const [move, setMove] = useState(0);

  return (
    <>
      <div className="navbar">
        <Link to="/" className="navbar-link">
          <h1>SUPER CARD GAME</h1>
        </Link>
      </div>
    </>
  );
}
