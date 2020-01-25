import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Layout, Breadcrumb, Menu, Button, notification, Row, Col, BackTop} from 'antd';
import Base from '../base';
import JobTable from '../queue/jobTable';
import JobForm from '../queue/jobForm';

import {errorNotification} from '../../util';


const { Content, Sider } = Layout;
const { SubMenu } = Menu;

class Home extends React.Component {
  state = {
    nodes: [],
    jobs: [],
    finished: false,
    scan: null,
    page: 1,
    pageSize: 10,
    paging: null,
    showForm: false
  }

  componentDidMount() {
    document.title = "Encode Hub"
    this.getNodes();
    this.getJobs();
    this.getScan();
  }

  getNodes() {
    axios.get("/api/nodes").then((response) => {
      this.setState({nodes: response.data.data})
    }).catch((err) => {
      errorNotification(err);
    });
  }

  getJobs() {
    const {finished, page, pageSize} = this.state;
    axios.get("/api/jobs", {params: {finished: +finished, page,pageSize}})
    .then((response) => {
      this.setState({jobs: response.data.data, paging: response.data.paging});
    })
    .catch((err) => {
      errorNotification(err);
    });
  }

  getScan() {
    axios.get("/api/scans/running")
    .then((response) => {
      this.setState({scan: response.data.data});
    })
    .catch((err) => {
      errorNotification(err);
    })
  }

  handleNewJob = (values) => {

  };

  handleEditJob = (jid, values) => {
    axios.post(`/api/jobs/${jid}`, values)
    .then((response) => {
      this.getJobs();
    })
    .catch((err) => {
      errorNotification(err);
    })
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
    .catch((err) => {
      errorNotification(err);
    })
  };

  handlePagination = (page, pageSize) => {
    this.setState({page, pageSize}, () => {
      this.getJobs();
    });
  };

  handlePageSize = (current, size) => {
    this.setState({pageSize: size}, () => {
      this.getJobs();
    });
  }

  toggleForm = () => {
    this.setState({showForm: !this.state.showForm});
  };

  toggleJobs = () => {
    this.setState({finished: !this.state.finished, page: 1}, this.getJobs);
  }

  getTableTitle = () => {
    return (
      <Row>
        <Col span={6}>
          <Button type="primary" style={{marginRight: "10px"}} onClick={this.toggleJobs}>Toggle job status</Button>
          <Button type="primary" onClick={this.toggleForm}>New job</Button>
        </Col>
        <Col span={12}>
          <h2>{this.state.finished ? "Finished jobs" : "Scheduled jobs"}</h2>
        </Col>
      </Row>
    );
  }

  render () {
    const {nodes, jobs, page, pageSize, paging, showForm} = this.state;

    return (
      <Base currentPage="Home">
        <BackTop/>
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>
              <Link to="/">
                Home
              </Link>
            </Breadcrumb.Item>
          </Breadcrumb>
          <Layout style={{ padding: '24px 0', background: '#fff' }}>
            <Sider width={200} style={{ background: '#fff' }}>
              <Menu
                mode="inline"
                defaultSelectedKeys={['1']}
                selectedKeys={["1"]}
                defaultOpenKeys={['sub1']}
                style={{ height: '100%' }}
              >
                <SubMenu
                  key="sub1"
                  title={
                    "Placeholder"
                  }
                >
                <Menu.Item>
                  <Link to={`#`}>
                    Some link
                  </Link>
                </Menu.Item>
                </SubMenu>
              </Menu>
            </Sider>
            <Content style={{ padding: '0 24px', minHeight: 280 }}>
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
                ) : null
              }
            </Content>
          </Layout>
        </Content>
      </Base>
    );
  }
}


export default Home;
