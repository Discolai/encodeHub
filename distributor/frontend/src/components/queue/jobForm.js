import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-responsive-modal';

class JobForm extends React.Component {

  state = {
    open: false,
    job: '',
    nid: '',
    finished: '',
    inputs: [
      {label: 'Job', name: 'job', type: "text", isRequired: true},
      {label: 'Finished', name: 'finished', type: 'checkbox', isRequired: false},
      {label: 'Nid', name: 'nid', type: "number", isRequired: false}
    ]
  }


  handleOpen = () => {
    if ('toEdit' in this.props) {
      for (const input of this.state.inputs) {
        const val = this.props.toEdit[input.name];
        if (input.type !== "text") {
          this.setState({[input.name]: val ? val.toString() : ""});
        } else {
          this.setState({[input.name]: val || ""});
        }
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
    const {name, value, type, checked} = e.target;
    // console.log(name, value, type, checked);
    if (type === "checkbox") {
      this.setState({[name]: checked ? 1 : 0});
    } else {
      this.setState({[name]: value});
    }
  }

  onSubmit = (e) => {
    e.preventDefault();

    // Get form input
    let form = {}
    this.state.inputs.map((x) => {
      if (this.state[x.name] == "") {
        form[x.name] = null;
      } else if (x.type === "checkbox") {
        form[x.name] = this.state[x.name] ? 1 : 0
      } else {
        form[x.name] = this.state[x.name]
      }
    })
    form["jid"] = this.props.toEdit.jid;

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
           checked={this.state[input.name]}
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

JobForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  modalHdr: PropTypes.string.isRequired,
  toEdit: PropTypes.object
}

export default JobForm;
