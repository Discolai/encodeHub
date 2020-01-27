import React from 'react';
import axios from 'axios';
import {Layout, Button, notification, Row, Col, BackTop, Skeleton} from 'antd';

import Base from '../base';
import JobTable from '../queue/jobTable';
import JobForm from '../queue/jobForm';
import ScanItem from '../scans/scanItem';
import {errorNotification} from '../../util';

const {Content} = Layout;


class Queue extends React.Component {
  state = {
    nodes: [],
    jobs: [],
    showFinished: false,
    showForm: false,
    page: 1,
    pageSize: 10,
    paging: null
  }

  componentDidMount() {
    this.getNodes();
    this.getJobs();
  }

  getNodes() {
    axios.get("/api/nodes")
    .then((response) => this.setState({nodes: response.data.data}))
    .catch((err) => errorNotification(err));
  }

  getJobs() {
    const {showFinished, page, pageSize} = this.state;
    axios.get("/api/jobs", {params: {finished: +showFinished, page,pageSize}})
    .then((response) => {
      this.setState({jobs: response.data.data, paging: response.data.paging});
    })
    .catch((err) => errorNotification(err));
  }

  handleNewJob = (values) => {
    axios.post("/api/jobs", [values])
    .then((response) => this.getJobs())
    .catch((err) => errorNotification(err));
  };

  handleEditJob = (jid, values) => {
    axios.post(`/api/jobs/${jid}`, values)
    .then((response) => this.getJobs())
    .catch((err) => errorNotification(err));
  };

  handleDeleteJob = (job) => {
    axios.delete(`/api/jobs/${job.jid}`)
    .then((response) => {
      this.getJobs();
      notification.open({
        message: "Info",
        description: `Deleted ${job.job}`
      });
    })
    .catch((err) => errorNotification(err));
  };

  handlePagination = (page, pageSize) => {
    this.setState({page, pageSize}, () => this.getJobs());
  };

  handlePageSize = (current, size) => {
    this.setState({pageSize: size}, () => this.getJobs());
  }

  toggleForm = () => {
    this.setState({showForm: !this.state.showForm});
  };

  toggleJobs = () => {
    this.setState({showFinished: !this.state.showFinished, page: 1}, this.getJobs);
  }

  getTableTitle = () => {
    return (
      <Row type="flex" justify="space-around">
        <Col>
          <Button type="primary" style={{marginRight: "0.5em"}} onClick={this.toggleJobs}>Toggle job status</Button>
          <Button type="primary" onClick={this.toggleForm}>New job</Button>
        </Col>
        <Col>
          <h2>{this.state.showFinished ? "Finished jobs" : "Scheduled jobs"}</h2>
        </Col>
      </Row>
    );
  }

  render () {
    const {nodes, jobs, page, pageSize, paging, showForm} = this.state;
    return (
      <Base currentPage="Home">
        <BackTop/>
        <Content style={{margin: "30px 50px 0"}}>
          <Content style={{background: "#FFF"}}>
            <ScanItem/>
            {
              showForm ? (
                <React.Fragment>
                  <JobForm
                    style={{marginTop: "20px", marginBottom: "20px"}}
                    title={"Add new job"}
                    nodes={nodes}
                    onSubmit={this.handleNewJob}
                    onCancel={this.toggleForm}
                  />
                <br/>
                </React.Fragment>
              ) : null
            }
            {
              paging ? (
                <React.Fragment>
                  <JobTable
                    title={this.getTableTitle}
                    dataSource={jobs}
                    nodes={nodes}
                    currentPage={page}
                    pageSize={pageSize}
                    totalItems={paging.totalResults}
                    pageSizeOptions={['10', '20', '30']}
                    onPageChange={this.handlePagination}
                    onSizeChange={this.handlePageSize}
                    onEdit={this.handleEditJob}
                    onDelete={this.handleDeleteJob}
                    />
                </React.Fragment>
              ) : <Skeleton/>
            }
          </Content>
        </Content>
      </Base>
    );
  }
}

export default Queue;
