import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-responsive-modal';
import Button from 'react-bootstrap/Button'

class NodeForm extends React.Component {

  state = {
    open: false,
    name: '',
    address: '',
    inputs: [
      {label: 'Name', name: 'name', type: "text", isRequired: true},
      {label: 'Address', name: 'address', type: "text", isRequired: true}
    ]
  }


  handleOpen = () => {
    if ('toEdit' in this.props) {
      for (var key in this.props.toEdit) {
        this.setState({[key]: this.props.toEdit[key] || ""});
      }
    }
    this.setState({open: true});
  }

  onClose = () => {
    // Reset all form fields and close modal
    this.setState({open: false});
    this.state.inputs.map((x) => this.setState([x.name]: ''));
  }

  onChange = (e) => {
    const {name, value} = e.target;
    this.setState({[name]: value});
  }

  onSubmit = (e) => {
    e.preventDefault();

    // Get form input
    let form = {}
    this.state.inputs.map((x) => form[x.name] = this.state[x.name])

    this.props.onSubmit(form);

    // Close modal
    this.onClose();
  }

  render () {
    const {children} = this.props;

    // Create array of inputs
    const inputs = [];
    this.state.inputs.forEach((input) => {
      inputs.push(
        <div className="col-sm-6 col-xs-12 form-group" key={input.name}>
          <label>{input.label}</label>
          <input
           className="form-control"
           type={input.type}
           value={this.state[input.name]}
           name={input.name}
           onChange={this.onChange}
           required={input.isRequired}
          />
        </div>
      );
    });

    return (
      <div>
        {
          children && React.Children.only(children).type === "button" ?
          React.cloneElement(React.Children.only(children), {onClick: this.handleOpen}) :
          (<button onClick={this.handleOpen}>open</button>)
        }
        <Modal open={this.state.open} onClose={this.onClose} center>
          <h3>{this.props.modalHdr}</h3>
          <form onSubmit={this.onSubmit}>
            <div className="form-row">
              {inputs}
            </div>
            <div className="mx-auto">
              <button className="btn btn-info" type="submit">
                Submit
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }
}

NodeForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  modalHdr: PropTypes.string.isRequired,
  toEdit: PropTypes.object
}

export default NodeForm;
