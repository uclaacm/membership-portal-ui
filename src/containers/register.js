import React from 'react';
import { connect } from 'react-redux';
import RegisterComponent from 'components/Register';
import { Action } from 'reducers';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.createUser = this.createUser.bind(this);
  }

  createUser(profile) {
    this.props.registerUser(profile);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.registered) {
      setTimeout(() => {
        this.props.registerDone();
      }, 1000);
    }
  }

  render() {
    return (
      <RegisterComponent
        createUser={this.createUser}
        created={this.props.registered}
        createSuccess={this.props.registerSuccess}
        createError={this.props.error}
      />
    );
  }
}

const mapStateToProps = state => ({
  user: state.Registration.get('user'),
  error: state.Registration.get('error'),
  registered: state.Registration.get('registered'),
  registerSuccess: state.Registration.get('registerSuccess'),
});

const mapDispatchToProps = dispatch => ({
  registerUser: (newuser) => {
    dispatch(Action.RegisterUser(newuser));
  },
  registerDone: () => {
    dispatch(Action.registerDone());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Register);