import React from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';

import { Action } from 'reducers';
import LoginComponent from 'components/Login';

class Login extends React.Component {
  handleLogin(email, password) {
    this.props.login(email, password);
  }

  componentWillMount() {
    if (this.props.authenticated) {
      this.props.redirectHome();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.authenticated) {
      this.props.redirectHome();
    }
  }

  render() {
    return <LoginComponent onsubmit={this.handleLogin.bind(this)} error={this.props.error} />;
  }
}

const mapStateToProps = state => ({
  error: state.Auth.get('error'),
  isAdmin: state.Auth.get('isAdmin'),
  timestamp: state.Auth.get('timestamp'),
  authenticated: state.Auth.get('authenticated'),
});

const mapDispatchToProps = dispatch => ({
  login: (email, password) => {
    dispatch(Action.LoginUser(email, password));
  },
  redirectHome: () => {
    dispatch(replace('/'));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
