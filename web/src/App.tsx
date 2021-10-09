import React, { useState } from "react";
import "./styles/App.css";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

//pages
import Home from "./components/Home";
import MyCollection from "./components/MyCollection";
import Store from "./components/Store";
import Play from "./components/Play";
import ConnectWallet from "./components/ConnectWallet";
import Game from "./components/Game";

import Navbar from "./components/Navbar";

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
            <Route path="/myCollection">
              <MyCollection />
            </Route>
            <Route path="/store">
              <Store />
            </Route>
            <Route path="/play">
              <Game />
            </Route>
          </Switch>
        )}
      </Router>
    </div>
  );
}

export default App;
