import React from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';

import {Layout, Breadcrumb, Menu, Icon, BackTop, Skeleton} from 'antd';

import Base from '../base';
import Cluster from './cluster';
import Node from './node';
import {errorNotification} from '../../util';

const { Content, Sider } = Layout;
const { SubMenu } = Menu;

class Nodes extends React.Component {
  state = {
    nodes: [],

  }

  componentDidMount() {
    const {nid} = this.props.match.params;
    this.getNodes();
    document.title = nid ? `Node ${nid}` : "Nodes";
  }

  componentDidUpdate(prevProps) {
    const {nid} = this.props.match.params;
    if (nid && nid !== prevProps.match.params.nid) {
      this.getNodes();
      document.title = `Node ${nid}`;
    } else if (!nid) {
      document.title = `Nodes`;
    }
  }

  getNodes = () => {
    axios.get("/api/nodes")
    .then((response) => {
      this.setState({nodes: response.data.data})
    })
    .catch((err) => errorNotification(err));
  }

  render () {
    const {nodes} = this.state;
    const {nid} = this.props.match.params;
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
                  node ? <Node history={this.props.history} node={node} getNodes={this.getNodes}/> : <Skeleton/>
                ) : (
                  <Cluster history={this.props.history}/>
                )
              }
            </Content>
          </Layout>
      </Content>
      </Base>
    );
  }
}

export default Nodes;
