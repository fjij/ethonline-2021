import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
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
