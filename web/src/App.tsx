import React, { useState } from "react";
import "./styles/App.css";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

//pages
import Home from "./components/Home";
import GameInstructions from "./components/GameInstructions";
import Store from "./components/Store";
import Play from "./components/Play";
import Game from "./components/Game";
import ConnectWallet from "./components/ConnectWallet";

import Navbar from "./components/Navbar";
import MyCollection from "./components/MyCollection";

function App() {
  const [isConnected, setConnected] = useState(false);
  return (
    <div className="app">
      <Router>
        <Navbar />
        {!isConnected && (
          <ConnectWallet onConnected={() => setConnected(true)} />
        )}
        {isConnected && (
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/gameInstructions">
              <GameInstructions />
            </Route>
            <Route path="/store">
              <Store />
            </Route>
            <Route path="/collection/oroegin">
              <MyCollection />
            </Route>
            <Route path="/play">
              <Play />
            </Route>
            <Route path="/game/:other">
              <Game />
            </Route>
          </Switch>
        )}
      </Router>
    </div>
  );
}

export default App;
