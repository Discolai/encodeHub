import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {msToHHMMSS, errorNotification} from '../../util';
import NodeForm from './nodeForm.jsx';
import { Card, Icon, Row, Col, Progress, Popconfirm, Button, notification } from 'antd';

class NodeItem extends React.Component {
  state = {
    node: this.props.node,
    progress: null,
    status: "Offline",
    showForm: false,
  }
  timer = null;

  componentDidMount() {
    this.timer = setInterval(() => this.getProgress(), 2000);
    this.getProgress();
  }

  componentDidUpdate(prevProps) {
    if(prevProps.node !== this.props.node) {
      this.setState({node: this.props.node});
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  getProgress() {
    const {node} = this.state;
    if (node) {
      axios.get(`${node.address}/job/progress`).then((response) => {
        const status = response.data.data.paused ? "Paused" : "Running";
        this.setState({progress: response.data.data, status: status});
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
    const {node} = this.state;
    axios.post(`${node.address}/job/stop`)
    .catch((err) => {
      errorNotification(err);
    });
  };

  handlePause = () => {
    const {node} = this.state;
    axios.post(`${node.address}/job/pause`)
    .catch((err) => {
      errorNotification(err);
    });
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
    .catch((err) => {
      errorNotification(err);
    })
  }


  render () {
    // const Form = Form.create({name: "Node Form"})(NodeForm);
    const {onEdit, onDelete} = this.props;
    const {node, status, progress, showForm} = this.state;

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
            <Card style={{backgroundColor: "#001529", color: "#FFF"}}>
              <Row type="flex" style={{alignItems: "center"}}>
                <Popconfirm
                  title="Are you sure？"
                  icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
                  onConfirm={(e) => onDelete(node)}
                >
                  <Button icon="minus" type="danger" style={{marginRight: "10px"}}/>
                </Popconfirm>
                <Button icon="edit" type="primary" style={{marginRight: "10px"}} onClick={this.toggleForm}/>
                <Button type="primary" onClick={this.pushConfig}>Push config</Button>
              </Row>
              <Row type="flex" style={{alignItems: "center", marginTop: "30px"}}>
                <Col span={12}>
                  <span>
                    <Icon type="info-circle" style={{ display: 'inline-block', verticalAlign: 'middle' }}/>
                    {" Status"}
                  </span>
                </Col>
                <Col span={12}>
                  {status}
                </Col>
              </Row>
              <Row type="flex" style={{alignItems: "center", marginTop: "10px"}}>
                <Col span={12}>
                  <span>
                    <Icon type="cluster" style={{ display: 'inline-block', verticalAlign: 'middle' }}/>
                    {" Node"}
                  </span>
                </Col>
                <Col span={12}>
                  {node ? node.name : ""}
                </Col>
              </Row>
              <Row type="flex" style={{alignItems: "center", marginTop: "10px"}}>
                <Col span={12}>
                  <span>
                    <Icon type="global" style={{ display: 'inline-block', verticalAlign: 'middle' }}/>
                    {" Address"}
                  </span>
                </Col>
                <Col span={12}>
                  {node ? node.address : ""}
                </Col>
              </Row>
              {
                progress ? (
                  <React.Fragment>
                    <Row type="flex" style={{alignItems: "center", marginTop: "30px"}}>
                      <Col span={12}>
                        <a onClick={() => this.handlePause()}>
                          <h2 style={{color: "#FFF"}}>
                            {progress.paused ? <Icon type="play-circle" style={{ display: 'inline-block', verticalAlign: 'middle' }}/> : <Icon type="pause-circle" style={{ display: 'inline-block', verticalAlign: 'middle' }}/>}
                          </h2>
                        </a>
                      </Col>
                    </Row>
                    <Row type="flex" style={{alignItems: "center", marginTop: "5px"}}>
                      <Col span={12}>
                        <span>
                          <Icon type="file-sync" style={{ display: 'inline-block', verticalAlign: 'middle' }}/>
                          {" Processing"}
                        </span>
                      </Col>
                      <Col span={12}>
                        {progress.job}
                      </Col>
                    </Row>
                    <Row type="flex" style={{alignItems: "center", marginTop: "10px"}}>
                      <Col span={12}>
                        <span>
                          <Icon type="dashboard" style={{ display: 'inline-block', verticalAlign: 'middle' }}/>
                          {" Speed"}
                        </span>
                      </Col>
                      <Col span={12}>
                        {`${progress.speed}x / ${progress.fps} fps`}
                      </Col>
                    </Row>
                    <Row type="flex" style={{alignItems: "center", marginTop: "20px"}}>
                      <Col span={12}>
                        <Progress type="dashboard" percent={progress.percentage ? progress.percentage : 0} format={(percent, successPercent) => <div style={{color: "#FFF"}}>{`${percent} %`}</div>}/>
                      </Col>
                      <Col span={12}>
                        <span>
                          <h2 style={{color: "#FFF"}}>
                            <Icon type="hourglass" style={{ display: 'inline-block', verticalAlign: 'middle' }}/>
                            {` ${msToHHMMSS(this.state.progress.remaining_time)}`}
                          </h2>
                        </span>
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
