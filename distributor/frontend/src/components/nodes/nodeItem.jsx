import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import io from 'socket.io-client';
import {msToHHMMSS, errorNotification, humanReadableFilesize} from '../../util';
import NodeForm from './nodeForm.jsx';
import InfoItem from '../infoItem';
import { Card, Icon, Row, Col, Progress, Popconfirm, Button, notification } from 'antd';

class NodeItem extends React.Component {
  state = {
    node: this.props.node,
    nodeInfo: null,
    progress: null,
    status: "Offline",
    showForm: false,
  }
  socket = null;

  setSocketIoCallbacks = () => {
    const {node} = this.props;
    if (node) {
      if (this.socket) this.socket.close();
      this.socket = io(node.address);
      this.socket.on("progress", progress => this.setState({progress, status: progress.paused ? "Paused" : "Processing"}));
      this.socket.on("connect", () => this.setState({status: "Polling"}));
      this.socket.on("disconnect", () => this.setState({status: "Offline"}));
    }
  }

  componentDidMount() {
    this.setSocketIoCallbacks();
    this.getNodeInfo();
  }

  componentDidUpdate(prevProps) {
    if(prevProps.node !== this.props.node) {
      this.setState({node: this.props.node});
      this.setSocketIoCallbacks();
    }
  }

  componentWillUnmount() {
    if (this.socket) {
      this.socket.close();
    }
  }

  getNodeInfo() {
    const {node} = this.state;
    if (node) {
      axios.get(`/api/nodes/info/${node.nid}`)
      .then((response) => {
        this.setState({nodeInfo: response.data.data});
      })
      .catch((err) => errorNotification(err));
    }
  }

  handleStop = () => {
    const {node} = this.state;
    axios.post(`${node.address}/job/stop`)
    .catch((err) => errorNotification(err));
  };

  handlePause = () => {
    const {node} = this.state;
    axios.post(`${node.address}/job/pause`)
    .catch((err) => errorNotification(err));
  };

  toggleForm = () => {
    this.setState({showForm: !this.state.showForm});
  };

  pushConfig = () => {
    const {node} = this.state;
    axios.post(`/api/nodes/setup/${node.nid}`)
    .then((response) => {
      notification.open({
        message: "Info",
        description: `Pushed config to ${node.name}`
      });
    })
    .catch((err) => errorNotification(err));
  }


  render () {
    const {onEdit, onDelete} = this.props;
    const {node, nodeInfo, status, progress, showForm} = this.state;

    return (
      <React.Fragment>
        {
          showForm ? (
            <NodeForm
              title="Edit node"
              node={node}
              onSubmit={onEdit}
              onCancel={this.toggleForm}
            />
          ) : (
            <Card style={{backgroundColor: "#001529", color: "#FFF", marginBottom: "1em"}}>
              <Row type="flex">
                <Col xs={24} sm={24} md={{offset: 4}} lg={{offset: 4}} xl={{offset: 4}}>
                  <Popconfirm
                    title="Are you sure？"
                    icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
                    onConfirm={(e) => onDelete(node)}
                  >
                    <Button icon="minus" type="danger" style={{marginRight: "0.5em"}}/>
                  </Popconfirm>
                  <Button icon="edit" type="primary" style={{marginRight: "0.5em"}} onClick={this.toggleForm}/>
                  {
                    status !== "Offline" ? (
                      <Button type="primary" onClick={this.pushConfig}>Push config</Button>
                    ) : null
                  }
                </Col>
              </Row>
              <InfoItem
                style={{marginTop: "2em"}}
                infoTitle="Status"
                icon="info-circle"
                info={status}
              />
              <InfoItem
                style={{marginTop: "0.5em"}}
                infoTitle="Node"
                icon="cluster"
                info={node ? node.name : null}
              />
              <InfoItem
                style={{marginTop: "0.5em"}}
                infoTitle="Address"
                icon="global"
                info={node ? node.address : null}
              />
              {
                nodeInfo ? (
                  <React.Fragment>
                    <InfoItem
                      style={{marginTop: "2em"}}
                      infoTitle="Total encode time"
                      icon="clock-circle"
                      info={msToHHMMSS(nodeInfo.sum_etime)}
                    />
                    <InfoItem
                      style={{marginTop: "0.5em"}}
                      infoTitle="Average encode time"
                      icon="clock-circle"
                      info={msToHHMMSS(nodeInfo.average_etime)}
                    />
                    <InfoItem
                      style={{marginTop: "0.5em"}}
                      infoTitle="Total finished encodes"
                      icon="number"
                      info={nodeInfo.finished_count || 0}
                    />
                    <InfoItem
                      style={{marginTop: "0.5em"}}
                      infoTitle="Total saved space"
                      icon="file"
                      info={humanReadableFilesize(nodeInfo.saved_space || 0)}
                    />
                  </React.Fragment>
                ) : null
              }
              {
                progress ? (
                  <React.Fragment>
                    <Row type="flex" style={{marginTop: "2em"}}>
                      <Col xs={24} sm={24} md={{offset: 4}} lg={{offset: 4}} xl={{offset: 4}}>
                        <a onClick={() => this.handlePause()}>
                          <Icon
                            style={{color: "#FFF", fontSize: "2em", marginRight: "0.5em"}}
                            type={progress.paused ? "play-circle" : "pause-circle"}
                            />
                        </a>
                        <a onClick={() => this.handleStop()}>
                          <Icon
                            style={{color: "#FFF", fontSize: "2em"}}
                            type="stop"
                            />
                        </a>
                      </Col>
                    </Row>
                    <InfoItem
                      style={{marginTop: "0.5em"}}
                      infoTitle="Processing"
                      icon="file-sync"
                      info={progress.job}
                    />
                    <InfoItem
                      style={{marginTop: "0.5em"}}
                      infoTitle="Remaining time"
                      icon="hourglass"
                      info={msToHHMMSS(this.state.progress.remaining_time)}
                    />
                    <InfoItem
                      style={{marginTop: "0.5em"}}
                      infoTitle="Speed"
                      icon="dashboard"
                      info={`${progress.speed}x / ${progress.fps} FPS`}
                    />
                  <Row type="flex">
                      <Col xs={24} sm={24} md={{span: 16, offset: 4}} lg={{span: 16, offset: 4}} xl={{span: 16, offset: 4}}>
                        <Progress
                          status={status === "Processing" ? "active" : "normal"}
                          percent={progress.percentage ? progress.percentage : 0}
                          format={(percent, successPercent) => <div style={{color: "#FFF"}}>{`${percent} %`}</div>}
                        />
                      </Col>
                    </Row>
                  </React.Fragment>
                ) : ""
              }
            </Card>
          )
        }
      </React.Fragment>
    );
  }
}
NodeItem.propTypes = {
  node: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default NodeItem;
