import React from 'react'
import axios from 'axios'
import NodeItem from './nodeItem'
import LogItem from '../logs/logItem'
import Navbar from '../navbar'

import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'

class Node extends React.Component {
  state = {
    nodes: [],
    logs: [],
    updateNode: false,
    updateLogs: false
  };

  componentDidMount() {
    this.getLogs(this.props.match.params.nid);
    this.getNodes();
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.nid !== prevProps.match.params.nid || this.state.updateLogs) {
      this.getLogs(this.props.match.params.nid);
    }
  }

  getNodes() {
    axios.get("/api/nodes").then((response) => {
      this.setState({nodes: response.data.data})
    }).catch((err) => {
      console.error(err);
    });
  }

  getLogs(nid) {
    axios.get(`/api/logs/node/${nid}`).then((response) => {
      this.setState({logs: response.data.data})
    }).catch((err) => {
      console.error(err);
    });
  }

  handleDelete = (node) => {
    axios.delete(`/api/nodes/${node.nid}`)
    .then((response) => {
      console.log("Deleted");
      this.props.history.push("/");
    })
    .catch((err) => {
      console.log(err.response.data);
    });
  };

  handleEdit = (node) => {
    const {nid, ...payload} = node;
    axios.post(`/api/nodes/${nid}`, payload)
    .then((response) => {
      this.getNodes();
    })
    .catch((err) => {
      console.log(err.response.data);
    })
  };

  render () {
    return (
      <Container fluid>
        <Navbar updateView={this.getNodes} nodes={this.state.nodes}>
          {
            this.state.nodes.map((node) => {
              if (node.nid == this.props.match.params.nid) {
                return (
                  <NodeItem
                    key={node.nid}
                    node={node}
                    onEdit={this.handleEdit}
                    onDelete={this.handleDelete}
                  ></NodeItem>
                );
              }
              return null
            })
          }
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
