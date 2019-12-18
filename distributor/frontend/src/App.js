import React, { Component } from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.css';
import Node from './components/nodes/cNode'

const notFound = () =>  {
  return (
    <h2>404 Not found!</h2>
  );
};

class App extends Component {
  render() {
    return (
      <Router>
          <Switch>
            <Route exact path="/node/:nid" component={Node} switch/>
            <Route component={notFound}/>
          </Switch>
      </Router>
    );
  }
}

export default App;
