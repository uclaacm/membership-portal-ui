import React from 'react';
import { connect } from 'react-redux';

import { Action } from 'reducers';
import Topbar from 'containers/topbar';
// import Sidebar from 'containers/sidebar';

import HomeComponent from 'components/Home/home';

class Home extends React.Component {
  componentWillMount() {
    if (this.props.authenticated) {
      this.props.fetchEvents();
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
    return (
      <div>
        <Topbar />
        {/* <Sidebar /> */}
        <HomeComponent />
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
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
