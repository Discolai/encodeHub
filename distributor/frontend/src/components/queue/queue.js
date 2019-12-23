import React from 'react'
import PropTypes from 'prop-types'
import Navbar from '../navbar'

class Queue extends React.Component {
  state = {
    jobs: []
  }

  getJobs() {

  }

  render () {
    return (
      <Navbar>
        <div>
          Queue
        </div>
      </Navbar>
    );
  }
}

export default Queue;
