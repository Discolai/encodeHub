import React from 'react'
import PropTypes from 'prop-types'

class LogItem extends React.Component {
  render () {
    const {lid, jid, nid, audio, video, subtitle, global_headers, other_streams, lsize, prev_size, muxing_overhead, drop_frames, dup_frames, elapsed_time} = this.props.log;
    return (
      <tr>
        <th>{lid}</th>
        <td>{jid}</td>
        <td>{nid}</td>
        <td>{audio} kiB</td>
        <td>{video} kiB</td>
        <td>{subtitle} kiB</td>
        <td>{global_headers} kiB</td>
        <td>{other_streams} kiB</td>
        <td>{lsize} kiB</td>
        <td>{prev_size} kiB</td>
        <td>{muxing_overhead}</td>
        <td>{drop_frames}</td>
        <td>{dup_frames}</td>
        <td>{elapsed_time}</td>
      </tr>
    );
  }
}
LogItem.propTypes = {
  log: PropTypes.object.isRequired,
}

export default LogItem;
