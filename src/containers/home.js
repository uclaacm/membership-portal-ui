import React from 'react';
import { connect } from 'react-redux';

import { Action } from 'reducers';
import Topbar from 'containers/topbar';
import HomeComponent from 'components/Home/home';

class Home extends React.Component {
  componentWillMount() {
    if (this.props.authenticated) {
      this.props.fetchEvents();
      this.props.fetchUser();
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
    const {
      events,
      isAdmin,
      isSuperAdmin,
      adminView,
      picture,
      username
    } = this.props;

    return (
      <div>
        <Topbar />
        <HomeComponent
          events={events}
          isAdmin={isAdmin}
          isSuperAdmin={isSuperAdmin}
          adminView={adminView}
          picture={picture}
          username={username}
          checkIn={this.props.checkIn}
          checkInPoints={this.props.checkInPoints}
          checkInSuccess={this.props.checkInSuccess}
          checkInError={this.props.checkInError}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  const userFetchSuccess = state.User.get("fetchSuccess");
  const profile = userFetchSuccess ? state.User.get("profile") : {};
  return {
    events: state.Events.get("events"),
    error: state.Events.get("error"),
    eventCreated: state.Events.get("posted"),
    eventCreateSuccess: state.Events.get("postSuccess"),
    eventUpdated: state.Events.get("updated"),
    eventUpdateSuccess: state.Events.get("updateSuccess"),
    authenticated: state.Auth.get("authenticated"),
    isAdmin: state.Auth.get("isAdmin"),
    isSuperAdmin: state.Auth.get("isSuperAdmin"),
    adminView: state.Auth.get("adminView"),
    picture: userFetchSuccess ? profile.picture : "",
    username: userFetchSuccess ? `${profile.firstName} ${profile.lastName}` : "",
    checkInSubmitted: state.CheckIn.get("submitted"),
    checkInPoints: state.CheckIn.get("numPoints"),
    checkInSuccess: state.CheckIn.get("success"),
    checkInError: state.CheckIn.get("error"),
  };
};

const mapDispatchToProps = dispatch => ({
  fetchEvents: ()       => dispatch(Action.GetCurrentEvents()),
  fetchUser: ()         => dispatch(Action.FetchUser()),
  checkIn: id           => dispatch(Action.CheckInto(id)),
  resetCheckIn: ()      => dispatch(Action.ResetCheckIn()),
  addEvent: event       => dispatch(Action.PostNewEvent(event)),
  updateEvent: event    => dispatch(Action.UpdateEvent(event)),
  updateDone: ()        => dispatch(Action.UpdateEventDone()),
  createDone: ()        => dispatch(Action.CreateEventDone()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
