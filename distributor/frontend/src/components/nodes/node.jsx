import React from 'react'
import axios from 'axios'
import NodeItem from './nodeItem'
import {Layout, Breadcrumb, Menu, Icon, notification, BackTop, Card, Row} from 'antd';
import {Link} from 'react-router-dom';
import Base from '../base';
import LogTable from '../logs/logTable';
import NodeForm from './nodeForm.jsx';
import InfoItem from '../infoItem';
import {errorNotification, msToHHMMSS, humanReadableFilesize} from '../../util';

const { Content, Sider } = Layout;
const { SubMenu } = Menu;


class Node extends React.Component {
  state = {
    nodes: [],
    nodesInfo: null,
    logs: [],
    page: 1,
    pageSize: 10,
    paging: null,
  };

  componentDidMount() {
    const {nid} = this.props.match.params;
    this.getNodes();
    if (nid) {
      document.title = `Node ${nid}`;
      this.getLogs(nid);
    } else {
      document.title = `Nodes`;
      this.getNodesInfo();
    }
  }

  componentDidUpdate(prevProps) {
    const {nid} = this.props.match.params;
    if (nid && nid !== prevProps.match.params.nid) {
      this.getLogs(nid);
    }
    if (!nid) {
      this.getNodesInfo();
    }
  }

  getNodes() {
    axios.get("/api/nodes")
    .then((response) => {
      this.setState({nodes: response.data.data})
    })
    .catch((err) => errorNotification(err));
  }

  getNodesInfo() {
    axios.get("/api/nodes/info")
    .then((response) => {
      this.setState({nodesInfo: response.data.data})
    })
    .catch((err) => errorNotification(err));
  }

  getLogs(nid) {
    const {page, pageSize} = this.state;
    axios.get(`/api/logs/node/${nid}`, {params: {page, pageSize}})
    .then((response) => {
      this.setState({logs: response.data.data,  paging: response.data.paging})
    })
    .catch((err) => errorNotification(err));
  }

  handleAdd = (values) => {
    axios.post("/api/nodes/", values)
    .then((response) => {
      this.getNodes();
      this.props.history.push(`/nodes/${response.data.data.id}`);
    })
    .catch((err) => errorNotification(err));
  };

  handleDelete = (node) => {
    axios.delete(`/api/nodes/${node.nid}`)
    .then((response) => {
      notification.open({
        message: "Info",
        description: `Deleted ${node.name}`
      });
      this.getNodes();
      this.props.history.push("/nodes");
    })
    .catch((err) => errorNotification(err));
  };

  handleEdit = (nid, values) => {
    axios.post(`/api/nodes/${nid}`, values)
    .then((response) => {
      this.getNodes();
    })
    .catch((err) => errorNotification(err));
  };

  handlePagination = (page, pageSize) => {
    this.setState({page, pageSize}, () => {
      this.getLogs(this.props.match.params.nid);
    });
  };

  handlePageSize = (current, size) => {
    this.setState({pageSize: size}, () => {
      this.getLogs(this.props.match.params.nid);
    });
  }

  render () {
    const {page, paging, pageSize, nodes, logs, nodesInfo} = this.state;
    const { nid } = this.props.match.params;

    const node = nodes.find((node) => node.nid === parseInt(nid, 10));

    const crumb = nid ? (
      <Breadcrumb.Item>
        <Link to={`/nodes/${nid}`}>
          {node ? node.name : nid}
        </Link>
      </Breadcrumb.Item>
    ) : null;

    const nodeLinks = nodes.map((node) => {
      return (
        <Menu.Item key={node.nid}>
          <Link to={`/nodes/${node.nid}`}>
            {node.name}
          </Link>
        </Menu.Item>
      );
    });

    return (
      <Base currentPage="Nodes">
        <BackTop/>
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>
              <Link to="/nodes">
                Nodes
              </Link>
            </Breadcrumb.Item>
            { crumb }
          </Breadcrumb>
          <Layout style={{ padding: '24px 0', background: '#fff' }}>
            <Sider width={200} style={{ background: '#fff' }}>
              <Menu
                mode="inline"
                defaultSelectedKeys={['1']}
                selectedKeys={[nid]}
                defaultOpenKeys={['sub1']}
                style={{ height: '100%' }}
              >
                <SubMenu
                  key="sub1"
                  title={
                    <span>
                      <Icon type="cluster" />
                      Nodes
                    </span>
                  }
                >
                  { nodeLinks }
                </SubMenu>
              </Menu>
            </Sider>
            <Content style={{ padding: '0 24px', minHeight: 280 }}>
              {
                nid ? (
                  <React.Fragment>
                    {
                      node ? (
                        <React.Fragment>
                          <NodeItem
                            key={node.nid}
                            node={node}
                            onEdit={this.handleEdit}
                            onDelete={this.handleDelete}
                          />
                          <LogTable
                            dataSource={logs}
                            currentPage={page}
                            pageSize={pageSize}
                            totalItems={paging ? paging.totalResults : 0}
                            pageSizeOptions={['10', '20', '30']}
                            onPageChange={this.handlePagination}
                            onSizeChange={this.handlePageSize}
                          />
                        </React.Fragment>
                      ) : null
                    }
                  </React.Fragment>
                ) : (
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
                      ) : null

                    }
                    <NodeForm
                      onSubmit={(values) => this.handleAdd(values)}
                      title="Add new node"
                      />
                  </React.Fragment>
                )
              }
            </Content>
          </Layout>
      </Content>
      </Base>
    );
  }
}

export default Node;
