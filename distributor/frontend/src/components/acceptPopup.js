import React from 'react'
import PropTypes from 'prop-types'

import Modal from 'react-responsive-modal'

class AcceptPopup extends React.Component {
  state = {open: false}

  handleOpen = () =>  {
    this.setState({open: !this.state.open})
  };

  getAcceptClasses = () =>  {
    let ret = "ml-3 btn btn-";
    if (this.props.role === "Delete") {
        return ret + "danger";
    } else {
      return ret + "primary";
    }
  };

  render () {
    const { children, modalHdr, onCancel, payload, onAccept} = this.props;
    return (
      <React.Fragment>
        {
          children && React.Children.only(children).type === "button" ?
          React.cloneElement(React.Children.only(children), {onClick: this.handleOpen}) :
          (<button onClick={this.handleOpen}>open</button>)
        }
        <Modal
          open={this.state.open}
          onClose={this.handleOpen}
          center
          styles={{
            modal: {
              padding: "50px"
            }
          }}
        >
          <h3>{modalHdr}</h3>
          <button
            className="btn btn-secondary"
            onClick={onCancel ? onCancel : this.handleOpen}
          >
            Cancel
          </button>
          <button
            className={this.getAcceptClasses()}
            onClick={() => {
              onAccept(payload);
              this.handleOpen();
            }}
          >
            {this.props.role ? this.props.role : "Accept"}
          </button>
        </Modal>
      </React.Fragment>
    );
  }
}

AcceptPopup.propTypes = {
  modalHdr: PropTypes.string.isRequired,
  onAccept: PropTypes.func.isRequired,
  payload:  PropTypes.object.isRequired,
  role:     PropTypes.string,
  onCancel: PropTypes.func
}

export default AcceptPopup;
