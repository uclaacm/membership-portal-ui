import React from 'react';
import { connect } from 'react-redux';

import { Action } from 'reducers';
import Topbar from 'containers/topbar';
import Sidebar from 'containers/sidebar';
import UserEvents from 'components/Events/UserEvents';
import AdminEvents from 'components/Events/AdminEvents';

class Events extends React.Component {
  componentWillMount() {
    if (this.props.authenticated) {
      this.props.fetchEvents();
      this.props.fetchUserRSVPs();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.eventUpdated || nextProps.eventCreated) {
      setTimeout(() => {
        this.props.updateDone();
        this.props.createDone();
      }, 250);
    }
  }

  render() {
    // Only show admin view if user is admin AND adminView is true
    const showAdminView = this.props.isAdmin && this.props.adminView;

    return (
      <div>
        <Topbar />
        {/* <Sidebar /> */}
        {!showAdminView ? (
          <UserEvents
            events={this.props.events}
            checkIn={this.props.checkIn}
            error={this.props.error}
            checkInSubmitted={this.props.checkInSubmitted}
            checkInSuccess={this.props.checkInSuccess}
            checkInError={this.props.checkInError}
            checkInPoints={this.props.checkInPoints}
            resetCheckIn={this.props.resetCheckIn}
            userRsvps={this.props.userRsvps}
            rsvpError={this.props.rsvpError}
            createRSVP={this.props.createRSVP}
            cancelRSVP={this.props.cancelRSVP}
          />
        ) : (
          <AdminEvents
            events={this.props.events}
            error={this.props.error}
            createEvent={this.props.createEvent}
            created={this.props.eventCreated}
            createSuccess={this.props.eventCreateSuccess}
            updated={this.props.eventUpdated}
            updateSuccess={this.props.eventUpdateSuccess}
            addEvent={this.props.addEvent}
            updateEvent={this.props.updateEvent}
            fetchEventRSVPs={this.props.fetchEventRSVPs}
            rsvpError={this.props.rsvpError}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  events: state.Events.get('events'),
  error: state.Events.get('error'),
  eventCreated: state.Events.get('posted'),
  eventCreateSuccess: state.Events.get('postSuccess'),
  eventUpdated: state.Events.get('updated'),
  eventUpdateSuccess: state.Events.get('updateSuccess'),
  authenticated: state.Auth.get('authenticated'),
  isAdmin: state.Auth.get('isAdmin'),
  adminView: state.Auth.get('adminView'),
  checkInSubmitted: state.CheckIn.get('submitted'),
  checkInPoints: state.CheckIn.get('numPoints'),
  checkInSuccess: state.CheckIn.get('success'),
  checkInError: state.CheckIn.get('error'),
  userRsvps: state.RSVP.get('userRsvps'),
  rsvpError: state.RSVP.get('error'),
});

const mapDispatchToProps = dispatch => ({
  fetchEvents: () => {
    dispatch(Action.GetCurrentEvents());
  },

  checkIn: (id) => {
    dispatch(Action.CheckInto(id));
  },

  resetCheckIn: () => {
    dispatch(Action.ResetCheckIn());
  },

  addEvent: (event) => {
    dispatch(Action.PostNewEvent(event));
  },

  updateEvent: (event) => {
    dispatch(Action.UpdateEvent(event));
  },

  updateDone: () => {
    dispatch(Action.UpdateEventDone());
  },

  createDone: () => {
    dispatch(Action.CreateEventDone());
  },

  fetchUserRSVPs: () => {
    dispatch(Action.FetchUserRSVPs());
  },

  createRSVP: (eventUuid) => {
    dispatch(Action.CreateRSVP(eventUuid));
  },

  cancelRSVP: (eventUuid) => {
    dispatch(Action.CancelRSVP(eventUuid));
  },

  fetchEventRSVPs: (eventUuid) => {
    dispatch(Action.FetchEventRSVPs(eventUuid));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Events);
