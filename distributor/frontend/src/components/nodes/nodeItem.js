import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import ProgressBar from 'react-bootstrap/ProgressBar'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faInfoCircle, faBuilding, faLocationArrow, faClock} from '@fortawesome/free-solid-svg-icons'

class NodeItem extends React.Component {
  state = {
    node: null,
    logs: [],
    progress: null,
    status: "Offline"
  }
  timer = null;

  componentDidMount() {
    this.getNode(this.props.nid);
    this.getProgress();
  }

  componentDidUpdate(prevProps) {
    if (this.props.nid !== prevProps.nid || this.props.updateNode) {
      this.getNode(this.props.nid);
      this.props.stopUpdateView();
    }
  }

  getNode(nid) {
    axios.get(`/api/nodes/${nid}`).then((response) => {
      this.setState({node: response.data.data})
    }).catch((err) => {
      console.error(err);
    });
  }

  getProgress() {
    const {node} = this.state;
    if (this.state.node) {
      axios.get(`${node.address}/job/progress`).then((response) => {
        console.log(response.data);
        this.setState({progress: response.data.data, status: "Running"})
      }).catch((err) => {
        if (err.response && err.response.status == 404) {
          this.setState({progress: null, status: "Polling"})
        } else {
          this.setState({status: "Offline"})
        }
      });
    }
  }

  render () {
    return (
      <div className="mx-auto bg-dark text-white p-3 mt-3">
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
    );
  }
}
NodeItem.propTypes = {
  stopUpdateView: PropTypes.func.isRequired,
  updateNode: PropTypes.bool.isRequired,
};

export default NodeItem;
