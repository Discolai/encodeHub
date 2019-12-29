import React from 'react'
import PropTypes from 'prop-types'
import ScanForm from './scanForm'
import AcceptPopup from '../acceptPopup'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFolder, faHourglassStart, faHourglassEnd, faStopCircle, faPlayCircle} from '@fortawesome/free-solid-svg-icons'


class ScanItem extends React.Component {
  render () {
    return (
      <div className="mx-auto bg-dark text-white p-3 mt-3">
        <div className="btn-group mb-2">
          {
            this.props.scan ? (
              <div>
                <AcceptPopup
                  modalHdr="Are you sure you want to stop this scan?"
                  onAccept={this.props.onStop}
                  payload={this.props.scan}
                  role="Delete"
                >
                  <button className="btn btn-danger">
                    <FontAwesomeIcon icon={faStopCircle}></FontAwesomeIcon>
                  </button>
                </AcceptPopup>
              </div>
            ) : (
              <ScanForm
                modalHdr="Start new scan"
                onSubmit={this.props.onAdd}
              >
                <button className="btn btn-primary">
                  <FontAwesomeIcon icon={faPlayCircle}></FontAwesomeIcon>
                </button>
              </ScanForm>
            )
          }

        </div>
        <div className="row px-md-n2">
          <div className="col px-md-2">
            <FontAwesomeIcon className="mr-2" icon={faFolder}></FontAwesomeIcon>
            Directory
          </div>
          <div className="col px-md-2">
            {this.props.scan ? this.props.scan.dir : null}
          </div>
        </div>
        <div className="row px-md-n2">
          <div className="col px-md-2">
            <FontAwesomeIcon className="mr-2" icon={faHourglassStart}></FontAwesomeIcon>
            Start
          </div>
          <div className="col px-md-2">
            {this.props.scan ? this.props.scan.start : null}
          </div>
        </div>
        <div className="row px-md-n2">
          <div className="col px-md-2">
            <FontAwesomeIcon className="mr-2" icon={faHourglassEnd}></FontAwesomeIcon>
            End
          </div>
          <div className="col px-md-2">
            {this.props.scan ? this.props.scan.stop : null}
          </div>
        </div>
      </div>
    );
  }
}
ScanItem.propTypes = {
  scan: PropTypes.object.isRequired,
  onStop: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
}

export default ScanItem;
