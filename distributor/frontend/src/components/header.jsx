import React from 'react';
import PropTypes from 'prop-types';
import { Layout, Menu } from 'antd';

const { Header } = Layout;

class PageHeader extends React.Component {

  render () {
    const { currentPage } = this.props;
    return (
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={[currentPage]}
          style={{ lineHeight: '64px' }}
        >
          <Menu.Item key="Queue">Queue</Menu.Item>
          <Menu.Item key="Nodes">Nodes</Menu.Item>
        </Menu>
      </Header>
    );
  }
}

PageHeader.propTypes = {
  currentPage: PropTypes.string.isRequired,
};

export default PageHeader;
