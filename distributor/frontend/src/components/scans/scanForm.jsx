import React from 'react';
import PropTypes from 'prop-types';
import {Form, Input, Button, Card} from 'antd';


const CustomizedForm = Form.create()((props) => {
  const { getFieldDecorator, validateFields } = props.form;

  const onSubmit = (e) => {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
          props.onSubmit(values);
      }
    });
  };

  return (
    <Form onSubmit={onSubmit} layout="inline">
      <Form.Item label="Directory">
        {
          getFieldDecorator(
            'dir', {
                rules: [
                  { required: true,
                    message: 'Please input a directory!'
                  },
                  {
                    min: 5,
                    message: "The directory path must be at least 5 characters!"
                  },
                  {
                    max: 255,
                    message: "The directory path cannot be longer than 255 characters!"
                  }
                ],
          })(<Input autoFocus={true}/>)
        }
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">Submit</Button>
      </Form.Item>
    </Form>
  );
});

class ScanForm extends React.Component {
  render () {
    const {title, onSubmit, ...restProps} = this.props;
    return (
      <Card title={title} {...restProps}>
        <CustomizedForm onSubmit={onSubmit}/>
      </Card>
    );
  }
}
ScanForm.propTypes = {
  title: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default ScanForm;
