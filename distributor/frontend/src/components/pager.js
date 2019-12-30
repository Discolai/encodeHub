import React from 'react'
import PropTypes from 'prop-types'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons'

class Pager extends React.Component {

  render () {
    const {currentPage, totalPages, onLink} = this.props
    const links = [];

    const start = currentPage < 5 ? 0 : currentPage-5;
    const end = start + 10;
    if (start != 0) {
      links.push(<button className="btn btn-primary">...</button>)
    }
    for (let i = start; i < end; i++) {
      const classes = currentPage === i ? "btn btn-primary active" : "btn btn-primary";
      links.push(<button key={i} className={classes} onClick={() => onLink(i)}>{i}</button>);
    }
    if (end < totalPages) {
      links.push(<button className="btn btn-primary">...</button>)
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
