import React from 'react'
import PropTypes from 'prop-types'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons'

class Pager extends React.Component {

  render () {
    const {currentPage, totalPages, onLink} = this.props
    const links = [];

    for (let i = 0; i < totalPages; i++) {
      const classes = currentPage === i ? "btn btn-primary active" : "btn btn-primary";
      links.push(<button key={i} className={classes} onClick={() => onLink(i)}>{i}</button>);
    }
    return (
      <div className="btn-group">
        <button className="btn btn-primary" onClick={() => onLink(currentPage - 1)}>
          <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
        </button>
        {links}
        <button className="btn btn-primary">
          <FontAwesomeIcon icon={faArrowRight} onClick={() => onLink(currentPage + 1)}></FontAwesomeIcon>
        </button>
      </div>
    );
  }
}
Pager.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onLink: PropTypes.func.isRequired
}

export default Pager;
