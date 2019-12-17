import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import LogItem from './logItem'

class Logs extends React.Component {
  state = {
    logs: []
  }

  componentDidMount() {
    axios.get("/api/logs").then((response) => {
      this.setState({logs: response.data.data})
    }).catch((err) => {
      console.error(err);
    });
  }


  render () {
    console.log(this.state.nodes);
    return (
      <div className="container">
        <table className="table table-striped table-bordered">
            <thead className="thead-dark">
              <tr>
                <th>Nid</th>
                <th>Name</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.logs.map((node) => {
                  return <NodeItem key={node.nid} node={node}></NodeItem>
                })
              }
            </tbody>
          </table>
      </div>
    );
  }
}

export default Logs;
