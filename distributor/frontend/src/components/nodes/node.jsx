import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {notification} from 'antd';

import NodeItem from './nodeItem'
import LogTable from '../logs/logTable';
import {errorNotification} from '../../util';


class Node extends React.Component {
  state = {
    logs : [],
    page: 1,
    pageSize: 10,
    paging: null
  }

  componentDidMount() {
    this.getLogs();
  }

  componentDidUpdate(prevProps) {
    if (this.props.node.nid !== prevProps.node.nid) {
      this.getLogs();
    }
  }

  getLogs() {
    const {page, pageSize} = this.state;
    const {node} = this.props;
    axios.get(`/api/logs/node/${node.nid}`, {params: {page, pageSize}})
    .then((response) => {
      this.setState({logs: response.data.data,  paging: response.data.paging})
    })
    .catch((err) => errorNotification(err));
  }

  handleDeleteNode = (node) => {
    axios.delete(`/api/nodes/${node.nid}`)
    .then((response) => {
      notification.open({
        message: "Info",
        description: `Deleted ${node.name}`
      });
      this.props.history.push("/nodes");
    })
    .catch((err) => errorNotification(err));
  };

  handleEditNode = (nid, values) => {
    axios.post(`/api/nodes/${nid}`, values)
    .then((response) => {
      this.props.getNodes();
    })
    .catch((err) => errorNotification(err));
  };

  handlePagination = (page, pageSize) => {
    this.setState({page, pageSize}, () => {
      this.getLogs(this.props.node.nid);
    });
  };

  handlePageSize = (current, size) => {
    this.setState({pageSize: size}, () => {
      this.getLogs(this.props.node.nid);
    });
  }

  render () {
    const {logs, page, pageSize, paging} = this.state;
    const {node} = this.props;

    return (
      <React.Fragment>
        <NodeItem
          key={node.nid}
          node={node}
          onEdit={this.handleEditNode}
          onDelete={this.handleDeleteNode}
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
    );
  }
}
Node.propTypes = {
  history: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired
}

export default Node;
