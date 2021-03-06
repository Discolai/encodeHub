import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'antd';
import {msToHHMMSS, humanReadableFilesize} from '../../util'

class LogTable extends React.Component {
  columns = [
    {
      title: "#",
      dataIndex: "lid",
      key: "lid"
    },
    {
      title: "Job",
      dataIndex: "job",
      key: "job"
    },
    {
      title: "Node",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Size",
      dataIndex: "lsize",
      key: "lsize",
      render: (text) => humanReadableFilesize(text)
    },
    {
      title: "Previous size",
      dataIndex: "prev_size",
      key: "prev_size",
      render: (text) => humanReadableFilesize(text)
    },
    {
      title: "Encode time",
      dataIndex: "elapsed_time_ms",
      key: "elapsed_time_ms",
      render: (text) => msToHHMMSS(text)
    },
  ];

  render () {
    const {dataSource, currentPage, pageSize, totalItems, onPageChange, onSizeChange, pageSizeOptions} = this.props;
    return (
      <Table
        rowKey="lid"
        dataSource={dataSource}
        columns={this.columns}
        pagination={{
          current: currentPage,
          size: pageSize,
          total: totalItems,
          showSizeChanger: true,
          pageSizeOptions: pageSizeOptions || ['10', '20', '30'],
          onChange: onPageChange,
          onShowSizeChange: onSizeChange
        }}
      />
    );
  }
}

LogTable.propTypes = {
  dataSource: PropTypes.array.isRequired,
  currentPage: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onSizeChange: PropTypes.func.isRequired,
  pageSizeOptions: PropTypes.array,
}

export default LogTable;
