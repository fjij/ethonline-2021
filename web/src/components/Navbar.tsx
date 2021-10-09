import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import { motion } from "framer-motion";

export default function Navbar() {
  const [animate, setAnimate] = useState("#000000");
  const [move, setMove] = useState(0);

  return (
    <>
      <div className="navbar">
        <Link to="/" className="navbar-link">
          <motion.h1 animate={{ color: animate, x: move }}>
            SUPER CARD GAME
          </motion.h1>
        </Link>
      </div>

      <button
        onClick={() => {
          setAnimate("#ff0000");
          setMove(100);
          setTimeout(() => {
            setAnimate("#000000");
          }, 1000);
        }}
      >
        Yes
      </button>
    </>
  );
}
