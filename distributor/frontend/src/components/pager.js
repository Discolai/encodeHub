import React from 'react'
import PropTypes from 'prop-types'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faAngleLeft, faAngleDoubleLeft, faAngleRight, faAngleDoubleRight} from '@fortawesome/free-solid-svg-icons'

class Pager extends React.Component {

  render () {
    const {currentPage, totalPages, onLink} = this.props
    const links = [];

    const start = currentPage < 5 ? 0 : currentPage-5;
    const end = totalPages < start+10 ? totalPages : start + 10;
    if (start != 0) {
      links.push(<button key="ldot" className="btn btn-primary">...</button>)
    }
    for (let i = start; i < end; i++) {
      const classes = currentPage === i ? "btn btn-primary active" : "btn btn-primary";
      links.push(<button key={i} className={classes} onClick={() => onLink(i)}>{i}</button>);
    }
    if (end < totalPages) {
      links.push(<button key="rdot" className="btn btn-primary">...</button>)
    }
    return (
      <div className="btn-group">
        <button key="larrow" disabled={currentPage === 0} className="btn btn-primary" onClick={() => onLink(currentPage - 1)}>
          <FontAwesomeIcon icon={faAngleLeft} ></FontAwesomeIcon>
        </button>
        <button key="ldarrow" disabled={currentPage <= 5} className="btn btn-primary" onClick={() => onLink(currentPage - 5)}>
          <FontAwesomeIcon icon={faAngleDoubleLeft} ></FontAwesomeIcon>
        </button>
        {links}
        <button key="rdarrow" disabled={currentPage >= totalPages-5} className="btn btn-primary" onClick={() => onLink(currentPage + 5)}>
          <FontAwesomeIcon icon={faAngleDoubleRight} ></FontAwesomeIcon>
        </button>
        <button key="rarrow" disabled={currentPage === totalPages-1} className="btn btn-primary">
          <FontAwesomeIcon icon={faAngleRight} onClick={() => onLink(currentPage + 1)}></FontAwesomeIcon>
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
