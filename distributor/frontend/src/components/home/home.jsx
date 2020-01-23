import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Layout, Breadcrumb, Menu, Icon, Button, notification, Row, Col} from 'antd';
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
    edit: null
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

  toggleForm = (jid) => {
    this.setState({edit: jid});
  };

  toggleJobs = () => {
    this.setState({finished: !this.state.finished}, this.getJobs);
  }

  render () {
    const {nodes, jobs, finished, scan, page, pageSize, paging, edit} = this.state;
    const job = edit ? jobs.find((job) => job.jid === parseInt(edit, 10)) : null;

    return (
      <Base currentPage="Home">
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
                edit ? (
                  <JobForm
                    title={`Edit job ${edit}`}
                    job={job}
                    nodes={nodes}
                    onSubmit={this.handleEditJob}
                    onCancel={() => this.toggleForm(null)}
                  />
                ) : null
              }
              {
                paging ? (
                  <React.Fragment>
                    <Row style={{alignItems: "center", marginTop: "10px"}}>
                      <Col span={6}>
                        <Button type="primary" onClick={this.toggleJobs}>Toggle jobs</Button>
                      </Col>
                      <Col span={12}>
                        <h2 style={{textAlign: "center"}}>{finished ? "Finished jobs" : "Scheduled jobs"}</h2>
                      </Col>
                    </Row>
                    <JobTable
                      dataSource={jobs}
                      currentPage={page}
                      pageSize={pageSize}
                      totalItems={paging.totalResults}
                      pageSizeOptions={['10', '20', '30']}
                      onPageChange={this.handlePagination}
                      onSizeChange={this.handlePageSize}
                      onEdit={this.toggleForm}
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
