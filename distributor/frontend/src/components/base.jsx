import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import PageHeader from './header';
import PageFooter from './footer';

class Base extends React.Component {
  render () {
    return (
      <Layout>
        <PageHeader currentPage={this.props.currentPage}/>
        {this.props.children}
        <PageFooter/>
      </Layout>
    );
  }
}

Base.propTypes = {
  currentPage: PropTypes.string.isRequired,
};

export default Base;
