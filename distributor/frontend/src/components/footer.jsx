import React from 'react'
import { Layout } from 'antd';

const { Footer } = Layout;

class PageFooter extends React.Component {
  render () {
    return (
      <Footer style={{ textAlign: 'center'}}>Encode Hub ©2020</Footer>
    );
  }
}

export default PageFooter;
