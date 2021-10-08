import React from 'react';
import Matchmaking from './Matchmaking';
import ConnectWallet from './ConnectWallet';
import './App.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

//pages
import Home from './Home';
import MyCollection from './MyCollection';
import Store from './Store';
import Play from './Play'

function App() {
  return (
    <>
    <Router>
      <Switch>
      <div className="app">
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/myCollection">
          <MyCollection/>
        </Route>
        <Route path="/store">
          <Store/>
        </Route>
        <Route path="/play">
          <Play />
        </Route>
      </div>
      </Switch>
    </Router>
    </>
  )
}

export default App;
