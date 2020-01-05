import React from 'react'
import PropTypes from 'prop-types'
import {msToHHMMSS} from '../../util'

class LogItem extends React.Component {
  render () {
    const {lid, jid, nid, audio, video, subtitle, lsize, prev_size, elapsed_time_ms} = this.props.log;
    return (
      <tr>
        <th>{lid}</th>
        <td>{jid}</td>
        <td>{nid}</td>
        <td>{audio} kiB</td>
        <td>{video} kiB</td>
        <td>{subtitle} kiB</td>
        <td>{lsize} kiB</td>
        <td>{prev_size} kiB</td>
        <td>{msToHHMMSS(elapsed_time_ms)}</td>
      </tr>
    );
  }
}
LogItem.propTypes = {
  log: PropTypes.object.isRequired,
}

export default LogItem;
