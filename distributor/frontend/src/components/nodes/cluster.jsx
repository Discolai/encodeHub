import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {Card, Row, Skeleton} from 'antd';

import NodeForm from './nodeForm';
import InfoItem from '../infoItem';
import {errorNotification, msToHHMMSS, humanReadableFilesize} from '../../util';


class Cluster extends React.Component {
  state = {
    nodesInfo: null
  }

  componentDidMount() {
    this.getNodesInfo();
  }

  getNodesInfo() {
    axios.get("/api/nodes/info")
    .then((response) => {
      this.setState({nodesInfo: response.data.data})
    })
    .catch((err) => errorNotification(err));
  }

  handleAddNode = (values) => {
    axios.post("/api/nodes/", values)
    .then((response) => {
      this.props.history.push(`/nodes/${response.data.data.id}`);
    })
    .catch((err) => errorNotification(err));
  };

  render () {
    const {nodesInfo} = this.state;
    return (
      <React.Fragment>
        {
          nodesInfo ? (
            <Card style={{backgroundColor: "#001529", color: "#FFF", marginBottom: "1em"}}>
              <Row type="flex" justify="center">
                <h1 style={{color: "#FFF"}}>Cluster info</h1>
              </Row>
              <InfoItem
                justify="center"
                infoTitle="Total encode time"
                icon="clock-circle"
                info={msToHHMMSS(nodesInfo.sum_etime)}
              />
              <InfoItem
                justify="center"
                style={{marginTop: "0.5em"}}
                infoTitle="Average encode time"
                icon="clock-circle"
                info={msToHHMMSS(nodesInfo.average_etime)}
              />
              <InfoItem
                justify="center"
                style={{marginTop: "0.5em"}}
                infoTitle="Total finished encodes"
                icon="number"
                info={nodesInfo.finished_count}
              />
              <InfoItem
                justify="center"
                style={{marginTop: "0.5em"}}
                infoTitle="Total saved space"
                icon="file"
                info={humanReadableFilesize(nodesInfo.saved_space)}
              />
            </Card>
          ) : <Skeleton/>

        }
        <NodeForm
          onSubmit={(values) => this.handleAddNode(values)}
          title="Add new node"
          />
      </React.Fragment>
    );
  }
}
Cluster.propTypes = {
  history: PropTypes.object.isRequired,
}

export default Cluster;
