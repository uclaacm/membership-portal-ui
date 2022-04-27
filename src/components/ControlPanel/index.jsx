import React from "react";
import PropTypes from "prop-types";

import Topbar from "containers/topbar";
import Sidebar from "containers/sidebar";
import ControlPanel from "./controlPanel";

export default class ControlPanelComponent extends React.Component {
  render() {
    const {
      logout,
      userEmail,
      events,
      deleteEvent,
      admins,
      removeAdmin,
      addAdmin,
      reassignAdmin,
      isSuperAdmin,
      changeOneClickPassword,
    } = this.props;
    return (
      <div className="controlpanel">
        <Topbar />
        <Sidebar />
        <ControlPanel
          logout={logout}
          userEmail={userEmail}
          events={events}
          deleteEvent={deleteEvent}
          admins={admins}
          removeAdmin={removeAdmin}
          addAdmin={addAdmin}
          reassignAdmin={reassignAdmin}
          isSuperAdmin={isSuperAdmin}
          changeOneClickPassword={changeOneClickPassword}
        />
      </div>
    );
  }
}

ControlPanelComponent.propTypes = {
  logout: PropTypes.func.isRequired,
  userEmail: PropTypes.string.isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteEvent: PropTypes.func.isRequired,
  admins: PropTypes.arrayOf(PropTypes.object).isRequired,
  removeAdmin: PropTypes.func.isRequired,
  addAdmin: PropTypes.func.isRequired,
  reassignAdmin: PropTypes.func.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  changeOneClickPassword: PropTypes.func.isRequired,
};
