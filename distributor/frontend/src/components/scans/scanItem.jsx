import React from 'react';
import axios from 'axios';
import {Card, Icon} from 'antd';

import InfoItem from '../infoItem';
import ScanForm from './scanForm';
import {errorNotification} from '../../util';

class ScanItem extends React.Component {
  state = {
    scan: null
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

  render () {
    const {scan} = this.state;
    return (
      scan ? (
        <Card style={{backgroundColor: "#001529", color: "#FFF", marginBottom: "1em"}}>
          <InfoItem
            infoTitle={scan.dir}
            icon="sync"
            iconSpin={true}
          />
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
