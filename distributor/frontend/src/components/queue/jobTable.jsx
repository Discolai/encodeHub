import React from 'react'
import PropTypes from 'prop-types'
import {Table, Button, Popconfirm, Icon} from 'antd';

class JobTable extends React.Component {
  columns = [
    {
      title: "#",
      dataIndex: "jid",
      key: "jid"
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
      title: "Actions",
      key: "actions",
      render: (text, job) => {
        return (
          <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            <Button type="primary" icon="edit" style={{marginRight: "10px"}} onClick={() => this.props.onEdit(job.jid)}/>
            <Popconfirm
              title="Are you sure?"
              icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
              onConfirm={() => this.props.onDelete(job)}
            >
              <Button type="danger">Delete</Button>
            </Popconfirm>
          </div>
        );
      }
    }
  ];

  render () {
    const {dataSource, currentPage, pageSize, totalItems, onPageChange, onSizeChange, pageSizeOptions} = this.props;
    return (
      <Table
        rowKey="jid"
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

JobTable.propTypes = {
  dataSource: PropTypes.array.isRequired,
  currentPage: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onSizeChange: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  pageSizeOptions: PropTypes.array,
}

export default JobTable;
