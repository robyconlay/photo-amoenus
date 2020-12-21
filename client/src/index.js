import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from './components/Home'
import Locations from './components/Locations'
import Location from './components/Location'
import Sidebar from './components/Sidebar'
import Favourites from './components/Favourites'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'

const Routing = () => {
  return (
    <>
      <Sidebar />
      <Router>
        <Switch>
          <Route exact path="/" component={App} />
          <Route exact path="/home" component={Home} />
          <Route exact path="/locations" component={Locations} />
          <Route exact path="/location/:id" component={Location} />
          <Route exact path="/favourites" component={Favourites} />
          <Route exact path="/signin" component={SignIn} />
          <Route exact path="/signup" component={SignUp} />
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
