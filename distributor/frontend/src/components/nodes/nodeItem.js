import React from 'react'
import PropTypes from 'prop-types'

class NodeItem extends React.Component {
  render () {
    const {nid, name, address} = this.props.node;
    return (
      <tr>
        <th>{nid}</th>
        <td>{name}</td>
        <td>{address}</td>
      </tr>
    );
  }
}
NodeItem.propTypes = {
  node: PropTypes.object.isRequired,
}

export default NodeItem;
