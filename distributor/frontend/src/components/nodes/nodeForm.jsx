import React from 'react';
import PropTypes from 'prop-types';
import {Form, Input, Button, Card} from 'antd';
import {URLPattern} from '../../util';

class NodeForm extends React.Component {
  handleSubmit = (e) => {
    const {onSubmit, onCancel, node} = this.props;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        node ? onSubmit(node.nid, values) : onSubmit(values);
        if (onCancel) {
          onCancel();
        }
      }
    });
 };

  render () {
    const {node, onCancel, title} = this.props;
    const {getFieldDecorator} = this.props.form;
    return (
      <Card title={title}>
        <Form onSubmit={this.handleSubmit}>
          <Form.Item
            label="Name"
          >
            {
              getFieldDecorator(
                'name', {
                    initialValue: node ? node.name : "",
                    rules: [
                      { required: true,
                        message: 'Please input a node name!'
                      },
                      {
                        min: 5,
                        message: "The name must be at least 5 characters!"
                      },
                      {
                        max: 255,
                        message: "The name cannot be longer than 255 characters!"
                      }
                    ],
              })(<Input/>)
            }
          </Form.Item>
          <Form.Item
            label="Address"
          >
          {
            getFieldDecorator(
              'address', {
                  initialValue: node ? node.address : "",
                  rules: [
                    { required: true,
                      message: 'Please input an address!'
                    },
                    {
                      pattern: URLPattern,
                      message: 'Invalid url!'
                    },
                    {
                      max: 255,
                      message: "The url cannot be longer than 255 characters!"
                    }
                  ],
            })(<Input/>)
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
NodeForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  onCancel: PropTypes.func,
  node: PropTypes.object,

}

export default Form.create()(NodeForm);
