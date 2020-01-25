import React from 'react';
import PropTypes from 'prop-types';
import {Form, Input, Checkbox, Select, Button, Card} from 'antd';

const {Option} = Select;

class JobForm extends React.Component {
  handleSubmit = (e) => {
    const {onSubmit, onCancel, job} = this.props;
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        job ? onSubmit(job.jid, values) : onSubmit(values);
        if (onCancel) {
          onCancel();
        }
      }
    });
 };

  render () {
    const {nodes, job, onCancel, title} = this.props;
    const {getFieldDecorator} = this.props.form;

    const options = nodes.map((node) => (
      <Option key={node.nid} value={node.nid}>{node.name}</Option>
    ));

    return (
      <Card title={title}>
        <Form onSubmit={this.handleSubmit} layout="inline">
          <Form.Item label="Job">
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
          <Form.Item label="Node">
            {
              getFieldDecorator('nid', {initialValue: job ? job.nid : null})(
                <Select style={{width: "200px"}}>
                  <Option key={null} value={null}>**unassigned**</Option>
                  {options}
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="Finished">
            {
              getFieldDecorator('finished', {
                initialValue: job && job.finished,
                valuePropName: "checked"
              })(<Checkbox />)
            }
          </Form.Item>
          <Form.Item>
            {
              onCancel ? (
                <Button type="secondary" style={{marginRight: "10px"}}onClick={onCancel}>Cancel</Button>
              ) : ""
            }
            <Button type="primary" htmlType="submit">Submit</Button>
          </Form.Item>
        </Form>
      </Card>
    );
  }
}
JobForm.propTypes = {
  nodes: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  onCancel: PropTypes.func,
  job: PropTypes.object,

}

export default Form.create()(JobForm);
