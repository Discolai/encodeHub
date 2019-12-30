import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import AcceptPopup from '../acceptPopup'
import NodeForm from './nodeForm'
import ProgressBar from 'react-bootstrap/ProgressBar'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faInfoCircle, faBuilding, faLocationArrow, faClock, faEdit, faMinusCircle, faFileVideo} from '@fortawesome/free-solid-svg-icons'

class NodeItem extends React.Component {
  state = {
    progress: null,
    status: "Offline"
  }
  timer = null;

  componentDidMount() {
    this.timer = setInterval(() => this.getProgress(), 2000);
    this.getProgress();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  getProgress() {
    const {node} = this.props;
    if (this.props.node) {
      axios.get(`${node.address}/job/progress`).then((response) => {
        const status = response.data.data.paused ? "Paused" : "Running";
        this.setState({progress: response.data.data, status: status})
      }).catch((err) => {
        if (err.response && err.response.status === 404) {
          this.setState({progress: null, status: "Polling"})
        } else {
          this.setState({status: "Offline"})
        }
      });
    }
  }

  handleStop = () => {
    const {node} = this.props;
    axios.post(`${node.address}/job/stop`)
    .catch((err) => {
      console.error(err);
    })

  };

  handlePause = () => {
    const {node} = this.props;
    axios.post(`${node.address}/job/pause`)
    .catch((err) => {
      console.error(err);
    })
  };

  render () {
    const editHdr = `Edit node ${this.props.node.nid}`;
    return (
      <div className="mx-auto bg-dark text-white p-3 mt-3">
        <div className="btn-group mb-2">
          <NodeForm
            modalHdr={editHdr}
            onSubmit={this.props.onEdit}
            toEdit={this.props.node}
          >
            <button className="btn btn-secondary">
              <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon>
            </button>
          </NodeForm>
          <AcceptPopup
            modalHdr="Are you sure you want to delete this node?"
            onAccept={this.props.onDelete}
            payload={this.props.node}
            type="Delete"
          >
            <button className="btn btn-danger">
              <FontAwesomeIcon icon={faMinusCircle}></FontAwesomeIcon>
            </button>
          </AcceptPopup>
        </div>
        <div className="row px-md-n2">
          <div className="col px-md-2">
            <FontAwesomeIcon className="mr-2" icon={faInfoCircle}></FontAwesomeIcon>
            Status
          </div>
          <div className="col px-md-2">
            {this.state.status}
          </div>
        </div>
        <div className="row px-md-n2">
          <div className="col px-md-2">
            <FontAwesomeIcon className="mr-2" icon={faBuilding}></FontAwesomeIcon>
            Node
          </div>
          <div className="col px-md-2">
            {this.props.node ? this.props.node.name : ""}
          </div>
        </div>
        <div className="row px-md-n2">
          <div className="col px-md-2">
            <FontAwesomeIcon className="mr-2" icon={faLocationArrow}></FontAwesomeIcon>
            Address
          </div>
          <div className="col px-md-2">
            {this.props.node ? this.props.node.address : ""}
          </div>
        </div>
        <br></br>
        {
          this.state.progress ? (
            <div>
              <div className="btn-group mb-2">
                <button className="btn btn-primary" onClick={this.handlePause}>Pause</button>
                <button className="btn btn-danger" onClick={this.handleStop}>Stop</button>
              </div>
              <div className="row px-md-n2">
                <div className="col px-md-2">
                  <FontAwesomeIcon className="mr-2" icon={faFileVideo}></FontAwesomeIcon>
                  File
                </div>
                <div className="col px-md-2">
                  {`{${this.state.progress.jid}} ${this.state.progress.job}`}
                </div>
              </div>
              <div className="row px-md-n2">
                <div className="col px-md-1">
                  <FontAwesomeIcon className="mr-2" icon={faClock}></FontAwesomeIcon>
                  {"Time"}
                </div>
                <div className="col px-md-2">
                  {this.state.progress.remaining_time}
                </div>
              </div>
              <ProgressBar animated={!this.state.progress.paused} now={this.state.progress.percentage} label={`${this.state.progress.percentage}%`}></ProgressBar>
            </div>
        ) :
          null
        }
      </div>
    );
  }
}
NodeItem.propTypes = {
  node: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default NodeItem;
