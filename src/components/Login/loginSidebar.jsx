import React from 'react';
import PropTypes from 'prop-types';
import Config from 'config';
import Button from 'components/Button';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Logo from './logo';

export default class LoginSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  handleLogin(response) {
    if (!response || !response.credential) return;

    const { onsubmit } = this.props;
    onsubmit(response.credential);
  }

  handleError(error) {
    const err = error ? 'Sign in failed.' : '';
    this.setState({ err });
  }

  render() {
    const { err } = this.state;

    return (
      <GoogleOAuthProvider clientId={Config.google.clientId}>
        <div className="login-sidebar">
          <div className="login-container">
            <Logo pic={'/assets/images/acm_wordmark_chapter.svg'} />
            <h1 className="login-title">Member Login</h1>
            <p className="login-description">
             Access exclusive resources, event registrations, and connect with the largest Computer Science community at UCLA.
            </p>

            <div className="sign-in">
              <GoogleLogin
                onSuccess={this.handleLogin}
                onError={this.handleError}
                shape="rectangular"
                logo_alignment="center"
                width="250px"
              />
            </div>

            <a className="back-btn" href='https://acm.cs.ucla.edu/'>Back to ACM website</a>

            {err ? (
              <span>
                <b>Error</b>
                :
                {err}
              </span>
            ) : (
              <span>&nbsp;</span>
            )}
          </div>
        </div>
      </GoogleOAuthProvider>
    );
  }
}

LoginSidebar.propTypes = {
  onsubmit: PropTypes.func.isRequired,
};
