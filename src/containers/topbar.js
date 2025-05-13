import React from 'react';
import { connect } from 'react-redux';

import { Action } from 'reducers';
import Topbar from 'components/Topbar';

class TopbarContainer extends React.Component {
  componentDidMount() {
    if (this.props.authenticated) {
      this.props.fetchUser();
    }
  }

  render() {
    const showAdminView = this.props.isAdmin && this.props.adminView;
    return <Topbar isAdmin={showAdminView} />;
  }
}

const mapStateToProps = state => ({
  fetchSuccess: state.User.get("fetchSuccess"),
  authenticated: state.User.get("authenticated"),
  isAdmin: state.Auth.get("isAdmin"),
  adminView: state.Auth.get("adminView"),
});

const mapDispatchToProps = dispatch => ({
  fetchUser: () => {
    dispatch(Action.FetchUser());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TopbarContainer);
