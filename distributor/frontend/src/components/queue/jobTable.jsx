import React from 'react'
import PropTypes from 'prop-types'
import {Form, Input, Checkbox, Select, Table, Button, Popconfirm, Icon, Badge} from 'antd';

class JobTable extends React.Component {
  state = {
    editing: "",
    jid: null
  }

  handleSubmit = (e) => {
    const {onEdit} = this.props;
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        onEdit(this.state.editing, values);
        this.setState({editing: ""})
      }
    });
 };

  render () {
    const {editing} = this.state;
    const {dataSource, nodes, currentPage, pageSize, totalItems, onPageChange, onSizeChange, pageSizeOptions, title} = this.props;
    const {getFieldDecorator} = this.props.form;

    const options = nodes.map((node) => (
      <Option key={node.nid} value={node.nid}>{node.name}</Option>
    ));

    return (
      <Form onSubmit={this.handleSubmit}>
      <Table
        title={title}
        bordered
        rowKey="jid"
        dataSource={dataSource}
        pagination={{
          current: currentPage,
          size: pageSize,
          total: totalItems,
          showSizeChanger: true,
          pageSizeOptions: pageSizeOptions || ['10', '20', '30'],
          onChange: onPageChange,
          onShowSizeChange: onSizeChange
        }}
      >
      <Table.Column
        title="#"
        dataIndex="jid"
        key="jid"
      />
      <Table.Column
        title="Status"
        dataIndex="finished"
        key="finished"
        render={(text, job) => {
          return (
            editing === job.jid ? (
              <Form.Item>
                {
                  getFieldDecorator('finished', {
                    initialValue: job && job.finished,
                    valuePropName: "checked"
                  })(<Checkbox />)
                }
              </Form.Item>
            ) : text ? (
              <Badge status="success" text="Finished"/>
            ) : (
              <Badge status="error" text="Scheduled"/>
            )
          );
        }}
      />
      <Table.Column
        title="Job"
        dataIndex="job"
        key="job"
        render={(text, job) => {
          return (
            editing === job.jid ? (
              <Form.Item>
                {
                  getFieldDecorator(
                    'job', {
                        initialValue: job ? job.job : "",
                        rules: [
                          { required: true,
                            message: 'Please input a job path!'
                          },
                          {
                            min: 5,
                            message: "The path path must be at least 5 characters!"
                          },
                          {
                            max: 255,
                            message: "The job path cannot be longer than 255 characters!"
                          }
                        ],
                  })(<Input/>)
                }
              </Form.Item>
            ) : text
          );
        }}
      />
      <Table.Column
        title="Node"
        dataIndex="name"
        key="name"
        render={(text, job) => {
          return (
            editing === job.jid ? (
              <Form.Item>
                {
                  getFieldDecorator('nid', {initialValue: job ? job.nid : null})(
                    <Select>
                      <Select.Option key={null} value={null}>**unassigned**</Select.Option>
                      {options}
                    </Select>
                  )
                }
              </Form.Item>
            ) : text
          );
        }}
      />
      <Table.Column
        title="Actions"
        key="actions"
        render={(text, job) => {
          return (
            <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
              {
                editing === job.jid ? (
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{marginRight: "10px"}}
                    >Save</Button>
                    <Button
                      htmlType="button"
                      type="secondary"
                      onClick={() => this.setState({editing: ""})}
                    >Cancel</Button>
                  </Form.Item>
                ) : (
                  <React.Fragment>
                    <Button
                      type="primary"
                      htmlType="button"
                      icon="edit"
                      style={{marginRight: "10px"}}
                      disabled={editing !== ""}
                      onClick={() => this.setState({editing: job.jid})}
                    />
                    <Popconfirm
                      title="Are you sure?"
                      icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
                      onConfirm={() => this.props.onDelete(job)}
                    >
                      <Button type="danger">Delete</Button>
                    </Popconfirm>
                  </React.Fragment>
                )
              }
            </div>
          );
        }}
      />
    </Table>
  </Form>
    );
  }
}

JobTable.propTypes = {
  title: PropTypes.func.isRequired,
  dataSource: PropTypes.array.isRequired,
  nodes: PropTypes.array.isRequired,
  currentPage: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onSizeChange: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  pageSizeOptions: PropTypes.array,
}

export default Form.create()(JobTable);
