import React, { Component } from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom'
import 'antd/dist/antd.css';
import Nodes from './components/nodes/nodes'
import Home from './components/home/home';

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
            <Route exact path="/" component={Home} switch/>
            <Route exact path="/nodes" component={Nodes} switch/>
            <Route exact path="/nodes/:nid" component={Nodes} switch/>
            <Route component={notFound}/>
          </Switch>
      </Router>
    );
  }
}

export default App;
