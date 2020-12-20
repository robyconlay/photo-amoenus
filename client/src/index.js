import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from './components/Home.js'
import Locations from './components/Locations.js'
import Sidebar from './components/Sidebar'
import Login from './components/Login'
import Favourites from './components/Favourites'

const Routing = () => {
  return (
    <>
      <Sidebar />
      <Router>
        <Switch>
          <Route exact path="/" component={App} />
          <Route exact path="/home" component={Home} />
          <Route exact path="/locations" component={Locations} />
          <Route exact path="/favourites" component={Favourites} />
          <Route exact path="/login" component={Login} />
        </Switch>
      </Router>
    </>
  )
}


ReactDOM.render(
  <React.StrictMode>
    <Routing />
  </React.StrictMode>,
  document.getElementById('root')
);
