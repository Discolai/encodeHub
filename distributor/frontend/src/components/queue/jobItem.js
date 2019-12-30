import React from 'react'
import PropTypes from 'prop-types'
import JobForm from './jobForm'
import AcceptPopup from '../acceptPopup'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faEdit} from '@fortawesome/free-solid-svg-icons'

class JobItem extends React.Component {
  render () {
    const {jid, nid, job, finished} = this.props.job;
    const payload = {jid, nid, job, finished: finished ? true : false};
    return (
      <tr>
        <th>{jid}</th>
        <td>{job}</td>
        <td>{finished ? "true" : "false"}</td>
        <td>{nid}</td>
        <td>
          <div className="btn-group">
            <JobForm
              onSubmit={this.props.onEdit}
              modalHdr="Edit job"
              toEdit={payload}
            >
              <button className="btn btn-primary">
                <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon>
              </button>
            </JobForm>
            <AcceptPopup
              modalHdr="Do you really want delete this job"
              onAccept={this.props.onDelete}
              payload={this.props.job}
              type="Delete"
            >
            <button className="btn btn-danger">
              <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
            </button>
          </AcceptPopup>
          </div>
        </td>
      </tr>
    );
  }
}
JobItem.propTypes = {
  job: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

export default JobItem;
