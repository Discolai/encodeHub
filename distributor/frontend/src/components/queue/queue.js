import React from 'react'
import PropTypes from 'prop-types'
import Navbar from '../navbar'
import JobItem from './jobItem'
import axios from 'axios'

import Table from 'react-bootstrap/Table'

class Queue extends React.Component {
  state = {
    nodes: [],
    jobs: []
  }

  componentDidMount() {
    this.getJobs();
  }

  getNodes() {
    axios.get("/api/nodes").then((response) => {
      this.setState({nodes: response.data.data})
    }).catch((err) => {
      console.error(err);
    });
  }

  getJobs() {
    axios.get("/api/jobs")
    .then((response) => {
      this.setState({jobs: response.data.data});
    })
    .catch((err) => {
      console.error(err);
    });
  }

  handleDelete = (job) => {
    axios.delete(`/api/jobs/${job.jid}`)
    .then((response) => {
      console.log("Deleted");
    })
    .catch((err) => {
      console.log(err.response.data);
    });
  };

  handleEdit = (job) => {
    const {jid, ...payload} = job;
    axios.post(`/api/nodes/${jid}`, payload)
    .then((response) => {
      this.getNodes();
    })
    .catch((err) => {
      console.log(err.response.data);
    })
  };

  render () {
    return (
      <Navbar nodes={this.state.nodes} updateView={() => {}}>
        <Table striped bordered hover size="sm">
          <thead className="thead-dark">
            <tr>
              <th>#</th>
              <th>Job</th>
              <th>Finished</th>
              <th>Nid</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.jobs.map((job) => {
                return (
                  <JobItem
                    key={job.jid}
                    job={job}
                    onEdit={this.handleEdit}
                    onDelete={this.handleDelete}
                  ></JobItem>
                )
              })
            }
          </tbody>
        </Table>
      </Navbar>
    );
  }
}

export default Queue;
