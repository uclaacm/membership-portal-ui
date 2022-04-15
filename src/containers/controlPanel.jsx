import React from "react";
import { connect } from "react-redux";
import { replace } from "react-router-redux";
import PropTypes from "prop-types";

import { Action } from "reducers";
import ControlPanelComponent from "components/ControlPanel";

class ControlPanel extends React.Component {
  componentWillMount() {
    const { isAdmin, redirectHome } = this.props;
    if (!isAdmin) {
      return redirectHome();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.isAdmin) {
      return nextProps.redirectHome();
    }
  }

  render() {
    const { logout, events, deleteEvent, admins, deleteAdmin, isSuperAdmin } = this.props;
    return (
      <ControlPanelComponent
        logout={logout}
        events={events.reverse()}
        deleteEvent={deleteEvent}
        admins={admins}
        deleteAdmin={deleteAdmin}
        isSuperAdmin={isSuperAdmin}
      />
    );
  }
}

const mapStateToProps = state => ({
  authenticated: state.Auth.get("authenticated"),
  isAdmin: state.Auth.get("isAdmin"),
  isSuperAdmin: state.Auth.get("isSuperAdmin"),
  events: state.Events.get("events"),
  admins: [{}, {}] /*state.Admins.get('admins')*/,
});

const mapDispatchToProps = dispatch => ({
  redirectHome: () => {
    dispatch(replace("/"));
  },
  logout: () => {
    dispatch(Action.LogoutUser());
  },
  deleteEvent: uuid => {
    dispatch(Action.DeleteEvent(uuid));
  },
  deleteAdmin: email => {
    dispatch(Action.DeleteAdmin(email));
  },
});

ControlPanel.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  redirectHome: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteEvent: PropTypes.func.isRequired,
  admins: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteAdmin: PropTypes.func.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);
