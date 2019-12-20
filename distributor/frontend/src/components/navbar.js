import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import {Link} from 'react-router-dom'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faServer, faPlusCircle, faPencil} from '@fortawesome/free-solid-svg-icons'
import Button from 'react-bootstrap/Button'
import NodeForm from './nodes/nodeForm'


class Navbar extends React.Component {

  state = {
    nodes: []
  };

  componentDidMount() {
    this.getNodes();
  }

  handleNew = (node) => {
    console.log(node);
    axios.post(`/api/nodes/`, node)
    .then((response) => {
      this.getNodes();
      this.props.updateView();
    })
    .catch((err) => {
      console.error(err.response);
    });
  };

  getNodes() {
    axios.get("/api/nodes").then((response) => {
      this.setState({nodes: response.data.data})
    }).catch((err) => {
      console.error(err);
    });
  }

  render () {
    return (
      <div>
        <div className="row">
          <div className="col-lg-2 col-sm-3 pl-4 bg-dark min-vh-100">
            <div className="py-4 position-fixed flex-grow-1">
              <ul className="navbar-nav mr-auto text-white">
                <div className="navbar-brand">
                  <div className="row">
                    <div className="col">
                      Nodes
                    </div>
                    <NodeForm
                      className="col"
                      onSubmit={this.handleNew}
                      modalHdr="New node"
                    >
                      <button className="btn btn-secondary">
                        <FontAwesomeIcon icon={faPlusCircle}></FontAwesomeIcon>
                      </button>
                    </NodeForm>
                  </div>
                </div>
                {
                  this.state.nodes.map((node) => {
                    const link = `/node/${node.nid}`;
                    return (
                      <li key={node.nid} className="nav-item">
                        <Link to={link} key={node.nid} className="nav-link">
                          <FontAwesomeIcon icon={faServer}></FontAwesomeIcon>
                          {" "}{node.name}
                        </Link>
                      </li>
                    );
                  })
                }
              </ul>
            </div>
          </div>
          <div className="col">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
Navbar.propTypes = {
  updateView: PropTypes.func.isRequired,
};


export default Navbar;
