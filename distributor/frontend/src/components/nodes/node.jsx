import React from 'react'
import axios from 'axios'
import NodeItem from './nodeItem'
import { Layout, Breadcrumb, Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import Base from '../base';
import LogTable from '../logs/logTable';
import NodeForm from './nodeForm.jsx';

const { Content, Sider } = Layout;
const { SubMenu } = Menu;


class Node extends React.Component {
  state = {
    nodes: [],
    logs: [],
    page: 1,
    pageSize: 10,
    paging: null,
    updateNode: false,
    updateLogs: false
  };

  componentDidMount() {
    document.title = `Node ${this.props.match.params.nid}`;
    this.getNodes();
    if (this.props.match.params.nid) {
      this.getLogs(this.props.match.params.nid);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.nid !== prevProps.match.params.nid || this.state.updateLogs) {
      this.getLogs(this.props.match.params.nid);
    }
  }

  getNodes() {
    axios.get("/api/nodes").then((response) => {
      this.setState({nodes: response.data.data})
    }).catch((err) => {
      console.error(err);
    });
  }

  getLogs(nid) {
    const {page, pageSize} = this.state;
    axios.get(`/api/logs/node/${nid}`, {params: {page, pageSize}}).then((response) => {
      this.setState({logs: response.data.data,  paging: response.data.paging})
    }).catch((err) => {
      console.error(err);
    });
  }

  handleAdd = (values) => {
    axios.post("/api/nodes/", values)
    .then((response) => {
      this.getNodes();
      this.props.history.push(`/nodes/${response.data.data.id}`);
    });
  };

  handleDelete = (node) => {
    axios.delete(`/api/nodes/${node.nid}`)
    .then((response) => {
      console.log("Deleted");
      this.props.history.push("/");
    })
    .catch((err) => {
      console.log(err.response.data);
    });
  };

  handleEdit = (nid, values) => {
    axios.post(`/api/nodes/${nid}`, values)
    .then((response) => {
      this.getNodes();
    })
    .catch((err) => {
      console.log(err.response.data);
    })
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
    const {page, paging, pageSize, nodes, logs} = this.state;
    const { nid } = this.props.match.params;
    const node = nodes.filter((node) => {
      return node.nid === parseInt(nid, 10);
    })

    let crumb = null;
    if (nid) {
      crumb = (
        <Breadcrumb.Item>
          <Link to={`/nodes/${nid}`}>
            {nid}
          </Link>
        </Breadcrumb.Item>
      );
    }

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
                      nodes.map((node) => {
                        if (node.nid === parseInt(nid, 10)) {
                          return (
                            <NodeItem
                              key={node.nid}
                              node={node}
                              onEdit={this.handleEdit}
                              onDelete={this.handleDelete}
                            ></NodeItem>
                          );
                        }
                        return null
                      })
                    }
                    <LogTable
                      dataSource={logs}
                      currentPage={page}
                      pageSize={pageSize}
                      totalPages={paging ? paging.totalResults : 0}
                      pageSizeOptions={['10', '20', '30']}
                      onPageChange={this.handlePagination}
                      onSizeChange={this.handlePageSize}
                    />
                  </React.Fragment>
                ) : (
                  <NodeForm
                    onSubmit={(values) => this.handleAdd(values)}
                    title="Add new node"
                  />
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
