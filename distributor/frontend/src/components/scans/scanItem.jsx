import React from 'react';
import axios from 'axios';
import {Card, Icon, Skeleton, notification} from 'antd';
import io from 'socket.io-client';

import InfoItem from '../infoItem';
import ScanForm from './scanForm';
import {errorNotification} from '../../util';

class ScanItem extends React.Component {
  state = {
    scan: null,
    scanning: false,
    lastAdded: ""
  }
  dataSocket = null;
  statusSocket = null;

  setSocketIoCallbacks = () => {
    if (!this.dataSocket) {
      this.dataSocket = io(window.location.href+"data", {reconnectionDelay: 1000});
    }
    this.dataSocket.on("scan", scan => {
      notification.open({duration: 1, message: scan.job, placement: "bottomRight"});
      this.setState({lastAdded: scan.job});
    });

    if (!this.statusSocket) {
      this.statusSocket = io(window.location.href+"status", {reconnectionDelay: 1000, forceNew: true });
    }
    this.statusSocket.on("scan", (status) => {
      this.setState({scanning: status.scanning});
      if (status.scanning) {
        this.getScan();
      }
    });
    this.statusSocket.on("disconnect", () => this.setState({scanning: false}));
  }

  componentDidMount() {
    this.setSocketIoCallbacks();
  }

  componentWillUnmount() {
    if (this.dataSocket) this.dataSocket.close();
    if (this.statusSocket) this.statusSocket.close();
  }

  getScan() {
    axios.get("/api/scans/running")
    .then((response) => this.setState({scan: response.data.data}))
    .catch((err) => errorNotification(err));
  }

  handleSubmitScan = (values) => {
    axios.post("/api/scans/start", values)
    .then((response) => this.getScan())
    .catch((err) => errorNotification(err));
  };

  handleStopScan = () => {
    axios.post(`/api/scans/stop/${this.state.scan.sid}`)
    .then((response) => notification.open({message: "Info", description: "Stopped scan"}))
    .catch((err) => errorNotification(err));
  }

  render () {
    const {scan, scanning} = this.state;
    return (
      scanning ? (
        <Card style={{backgroundColor: "#001529", color: "#FFF", marginBottom: "1em"}}>

          {
            scan ? (
              <InfoItem
                infoTitle={scan.dir}
                icon="sync"
                iconSpin={true}
                info={(
                  <div onClick={() => this.handleStopScan()}>
                    <Icon
                      style={{color: "#FFF", fontSize: "2em"}}
                      type="stop"
                      />
                  </div>
                )}
              />
          ) : <Skeleton/>
          }
        </Card>
      ) : (
        <ScanForm
          onSubmit={this.handleSubmitScan}
          style={{marginBottom: "1em"}}
          title="Start new scan"
        />
      )
    );
  }
}

export default ScanItem;
