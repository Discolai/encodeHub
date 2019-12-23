import React from 'react'
import PropTypes from 'prop-types'

class JobItem extends React.Component {
  render () {
    const {jid, nid, job, timestamp} = this.props.job;
    return (
      <tr>
        <th>{jid}</th>
        <td>{job}</td>
        <td>{timestamp}</td>
        <td>{nid}</td>
      </tr>
    );
  }
}
JobItem.propTypes = {
  job: PropTypes.object.isRequired
}

export default JobItem;
