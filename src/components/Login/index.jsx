import React from 'react';
import PropTypes from 'prop-types';
import LoginSidebar from './loginSidebar';
import Banner from './banner';

export default class LoginComponent extends React.Component {
  render() {
    const { onsubmit, loginError } = this.props;
    return (
      <div className="login">
        <LoginSidebar onsubmit={onsubmit} loginError={loginError} />
        <div className="login-tile">
          <Banner decorative={false} />
        </div>
      </div>
    );
  }
}

LoginComponent.propTypes = {
  onsubmit: PropTypes.func.isRequired,
  loginError: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.object]),
};

LoginComponent.defaultProps = {
  loginError: null,
};
