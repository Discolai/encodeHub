import React, { Component } from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.css';
import 'antd/dist/antd.css';
import Node from './components/nodes/node'
import Queue from './components/queue/queue'

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
            <Route exact path="/" component={Queue} switch/>
            <Route exact path="/nodes" component={Node} switch/>
            <Route exact path="/nodes/:nid" component={Node} switch/>
            <Route component={notFound}/>
          </Switch>
      </Router>
    );
  }
}

export default App;
