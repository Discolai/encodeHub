import React from 'react'
import PropTypes from 'prop-types'
import Navbar from '../navbar'
import JobItem from './jobItem'
import ScanItem from './scanItem'
import axios from 'axios'
import Pager from '../pager'

import Table from 'react-bootstrap/Table'

class Queue extends React.Component {
  state = {
    nodes: [],
    jobs: [],
    page: 0,
    paging: null,
    scan: null,
    finished: false
  }

  componentDidMount() {
    this.getJobs();
    this.getNodes();
    this.getScan();
  }

  getNodes() {
    axios.get("/api/nodes").then((response) => {
      this.setState({nodes: response.data.data})
    }).catch((err) => {
      console.error(err);
    });
  }

  getJobs() {
    axios.get("/api/jobs", {params: {finished: +this.state.finished, page: this.state.page}})
    .then((response) => {
      this.setState({jobs: response.data.data, paging: response.data.paging});
    })
    .catch((err) => {
      console.error(err);
    });
  }

  getScan() {
    axios.get("/api/scans/running")
    .then((response) => {
      this.setState({scan: response.data.data});
    })
    .catch((err) => {
      console.log(err);
    })
  }

  handleDelete = (job) => {
    axios.delete(`/api/jobs/${job.jid}`)
    .then((response) => {
      console.log("Deleted");
      this.getJobs();
    })
    .catch((err) => {
      console.log(err.response.data);
    });
  };

  handleEdit = (job) => {
    const {jid, ...payload} = job;
    axios.post(`/api/jobs/${jid}`, payload)
    .then((response) => {
      this.getJobs();
    })
    .catch((err) => {
      console.log(err.response.data);
    })
  };

  handleAddScan = (scan) => {
    axios.post("/api/scans/start", scan)
    .then((response) => {
      this.getScan();
    })
    .catch((err) => {
      console.log(err.response);
    });
  };

  handleStopScan = (scan) => {
    axios.post(`/api/scans/stop/${scan.sid}`)
    .then((response) => {
      console.log(scan.sid, "stopping");
      this.getScan();
    })
    .catch((err) => {
      console.log(err.response);
    });
  };

  render () {
    const {nodes, finished, paging, page} = this.state;

    const pagination = (
      <Pager
        currentPage={page}
        totalPages={paging ? paging.totalPages : 0}
        onLink={(page) => {
          if (page < paging.totalPages && page >= 0) {
            this.setState({page: page}, this.getJobs);
          }
        }}
      ></Pager>
    );

    return (
      <Navbar nodes={this.state.nodes} updateView={() => this.getNodes()}>
        <div>
          <button className="btn btn-primary" onClick={() => {
              this.setState({finished: !this.state.finished, page: 0}, this.getJobs);
            }}
          >
            Toggle finished jobs
          </button>
        </div>
        <ScanItem
          scan={this.state.scan}
          onStop={this.handleStopScan}
          onAdd={this.handleAddScan}
          onEdit={this.handleEditScan}
        ></ScanItem>
        <br></br>
        {
          this.state.paging ? (
            <div className="row align-items-center justify-content-center mb-1">
              {pagination}
            </div>
          ) : ""
        }
        <Table striped bordered hover size="sm">
          <thead className="thead-dark">
            <tr>
              <th>#</th>
              <th>Job</th>
              <th>Finished</th>
              <th>Retrieved by</th>
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
        {
          this.state.paging ? (
            <div className="row align-items-center justify-content-center mb-1">
              {pagination}
            </div>
          ) : ""
        }
      </Navbar>
    );
  }
}

export default Queue;
