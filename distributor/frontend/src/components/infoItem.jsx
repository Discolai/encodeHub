import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col, Icon} from 'antd';

class InfoItem extends React.Component {
  render () {
    const {infoTitle, icon, info, style, ...restProps} = this.props;
    return (
      <Row type="flex" style={{alignItems: "center", ...style}} {...restProps}>
        <Col xs={24} sm={24} md={{span: 8, offset: 4}}>
          <span>
            {icon ? <Icon type={icon} /> : null}
            <span style={icon ? {paddingLeft: "0.5em"} : null}>{infoTitle}</span>
          </span>
        </Col>
        <Col xs={24} sm={24} md={{span: 8, offset: 4}}>
          {info}
        </Col>
      </Row>
    );
  }
}
InfoItem.propTypes = {
  infoTitle: PropTypes.any.isRequired,
  info: PropTypes.any.isRequired,
  icon: PropTypes.string,
  style: PropTypes.object,
}

export default InfoItem;
