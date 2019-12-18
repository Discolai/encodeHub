import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import NodeItem from './nodeItem'
import LogItem from '../logs/logItem'
import Navbar from '../navbar'

import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import ProgressBar from 'react-bootstrap/ProgressBar'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faInfoCircle, faBuilding, faLocationArrow, faClock} from '@fortawesome/free-solid-svg-icons'

class Node extends React.Component {
  state = {
    node: null,
    logs: [],
    progress: null
  }
  timer = null;

  componentDidMount() {
    this.timer = setInterval(() => this.getProgress(), 2000)
    this.getNode(this.props.match.params.nid);
    this.getLogs(this.props.match.params.nid);
    this.getProgress()
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.nid !== prevProps.match.params.nid) {
      this.getNode(this.props.match.params.nid);
      this.getLogs(this.props.match.params.nid);
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    this.timer = null;
  }

  getNode(nid) {
    axios.get(`/api/nodes/${nid}`).then((response) => {
      this.setState({node: response.data.data})
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

  getProgress() {
    const {node} = this.state;
    if (this.state.node) {
      axios.get(`${node.address}/job/progress`).then((response) => {
        console.log(response.data);
        this.setState({progress: response.data.data})
      }).catch((err) => {
        if (err.response && err.response.status == 404) {
          this.setState({progress: null})
        } else if (err.response) {
          console.error(err.response);
        }
      });
    }
  }

  render () {
    return (
      <Container fluid>
        <Navbar>
          <div className="mx-auto bg-dark text-white p-3 mt-3">
            <div className="row px-md-n2">
              <div className="col px-md-2">
                <FontAwesomeIcon className="mr-2" icon={faInfoCircle}></FontAwesomeIcon>
                Status
              </div>
              <div className="col px-md-2">
                {this.state.progress ? "Running" : "Polling"}
              </div>
            </div>
            <div className="row px-md-n2">
              <div className="col px-md-2">
                <FontAwesomeIcon className="mr-2" icon={faBuilding}></FontAwesomeIcon>
                Node
              </div>
              <div className="col px-md-2">
                {this.state.node ? this.state.node.name : ""}
              </div>
            </div>
            <div className="row px-md-n2">
              <div className="col px-md-2">
                <FontAwesomeIcon className="mr-2" icon={faLocationArrow}></FontAwesomeIcon>
                Address
              </div>
              <div className="col px-md-2">
                {this.state.node ? this.state.node.address : ""}
              </div>
            </div>
            <br></br>
            {
              this.state.progress ? (
                <div>
                  <ProgressBar now={this.state.progress.percentage} label={`${this.state.progress.percentage}%`}></ProgressBar>
                  <div className="row px-md-n2">
                    <div className="col px-md-2">
                      <FontAwesomeIcon className="mr-2" icon={faClock}></FontAwesomeIcon>
                      {"Time"}
                    </div>
                    <div className="col px-md-2">
                      {this.state.progress.remaining_time}
                    </div>
                  </div>
                </div>
            ) :
              null
            }
          </div>


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
