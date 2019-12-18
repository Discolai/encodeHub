import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import {Link} from 'react-router-dom'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faServer} from '@fortawesome/free-solid-svg-icons'


class Navbar extends React.Component {

  state = {
    nodes: []
  };

  componentDidMount() {
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
              <ul className="navbar-nav mr-auto">
                {
                  this.state.nodes.map((node) => {
                    const link = `/node/${node.nid}`;
                    return (
                      <li key={node.nid} className="nav-item">
                        <Link to={link} key={node.nid} className="nav-link text-white">
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

export default Navbar;
