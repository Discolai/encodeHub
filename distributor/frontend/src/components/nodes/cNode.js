import React from 'react'
import axios from 'axios'
import NodeItem from './nodeItem'
import LogItem from '../logs/logItem'
import Navbar from '../navbar'

import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'

class Node extends React.Component {
  state = {
    logs: [],
    updateNode: false,
    updateLogs: false
  };

  componentDidMount() {
    this.getLogs(this.props.match.params.nid);
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.nid !== prevProps.match.params.nid || this.state.updateLogs) {
      this.getLogs(this.props.match.params.nid);
    }
  }

  getLogs(nid) {
    axios.get(`/api/logs/node/${nid}`).then((response) => {
      this.setState({logs: response.data.data})
    }).catch((err) => {
      console.error(err);
    });
  }

  render () {
    return (
      <Container fluid>
        <Navbar
          updateView={() => this.setState({updateLogs: true, updateNode: true})}
        >
          <NodeItem
            nid={this.props.match.params.nid}
            stopUpdateView={() => this.setState({updateLogs: false, updateNode: false})}
            updateNode={this.state.updateNode}
          >
          </NodeItem>
          <br></br>
            <Table striped bordered hover size="sm">
              <thead className="thead-dark">
                <tr>
                  <th>#</th>
                  <th>Jid</th>
                  <th>Nid</th>
                  <th>Audio</th>
                  <th>Video</th>
                  <th>Subtitle</th>
                  <th>Total size</th>
                  <th>Previous size</th>
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
            </Table>
        </Navbar>
      </Container>
    );
  }
}

export default Node;
