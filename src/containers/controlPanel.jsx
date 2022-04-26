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
    // when data is actually fetched
    // note: previously left out when only events were needed to be fetched for control panel
    // this led to bug where admin had to navigate to events page first to load events in control panel modal 
    this.props.fetchEvents();
    this.props.fetchAdmins();   
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.isAdmin) {
      return nextProps.redirectHome();
    }
  }

  render() {
    const { logout, events, deleteEvent, admins, deleteAdmin, addAdmin, isSuperAdmin } = this.props;
    return (
      <ControlPanelComponent
        logout={logout}
        events={events.reverse()}
        deleteEvent={deleteEvent}
        admins={admins}
        deleteAdmin={deleteAdmin}
        addAdmin={addAdmin}
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
  admins: state.User.get("admins"),
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
  addAdmin: email => {
    dispatch(Action.AddAdmin(email));
  },

  fetchEvents: () => {
    dispatch(Action.GetCurrentEvents());
  },

  fetchAdmins: () => {
    dispatch(Action.FetchAdmins());
  }
});

ControlPanel.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  redirectHome: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteEvent: PropTypes.func.isRequired,
  admins: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteAdmin: PropTypes.func.isRequired,
  addAdmin: PropTypes.func.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);
