import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import NodeItem from './nodeItem'
import LogItem from '../logs/logItem'

class Node extends React.Component {
  state = {
    nid: null,
    node: null,
    logs: []
  }

  componentDidMount() {
    this.setState({nid: this.props.match.params.nid}, () => {
      axios.get(`/api/nodes/${this.state.nid}`).then((response) => {
        this.setState({node: response.data.data})
      }).catch((err) => {
        console.error(err);
      });
      axios.get(`/api/logs/node/${this.state.nid}`).then((response) => {
        this.setState({logs: response.data.data})
      }).catch((err) => {
        console.error(err);
      });
    });
  }

  render () {
    console.log(this.state.nid);
    return (
      <div className="container">
        <table className="table table-striped table-bordered">
          <thead className="thead-dark">
            <tr>
              <th>Nid</th>
              <th>Name</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.node ? <NodeItem key={this.state.node.nid} node={this.state.node}></NodeItem> : null
            }
          </tbody>
        </table>
        <br></br>
          <table className="table table-striped table-bordered">
            <thead className="thead-dark">
              <tr>
                <th>Lid</th>
                <th>Jid</th>
                <th>Nid</th>
                <th>Audio</th>
                <th>Video</th>
                <th>Subtitle</th>
                <th>Global headers</th>
                <th>Other streams</th>
                <th>Total size</th>
                <th>Previous size</th>
                <th>Muxing overhead</th>
                <th>Dropped frames</th>
                <th>Dup frames</th>
                <th>Elapsed time</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.logs.map((log) => {
                  return <LogItem key={log.lid} log={log}></LogItem>
                })
              }
            </tbody>
          </table>
      </div>
    );
  }
}

export default Node;
