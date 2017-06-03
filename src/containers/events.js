import React from 'react';
import {connect} from 'react-redux';

import moment from 'moment';

import Config from 'config';
import {Action} from 'reducers';
import Topbar from 'containers/topbar';
import Sidebar from 'containers/sidebar';
import UserEvents from 'components/Events/UserEvents'
import AdminEvents from 'components/Events/AdminEvents'

class Events extends React.Component {
	componentWillMount() {
		if (this.props.authenticated) {
			this.props.fetchEvents();
		}
	}

	render(){
		return (
			<div>
				<Topbar />
				<Sidebar />
				{ !this.props.isAdmin ? <UserEvents events={this.props.events}
													checkIn={this.props.checkIn}
													error={this.props.error}
													checkInSubmitted={this.props.checkInSubmitted}
													checkInSuccess={this.props.checkInSuccess}
													checkInError={this.props.checkInError}
													checkInPoints={this.props.checkInPoints}
													resetCheckIn={this.props.resetCheckIn} /> :
				                        <AdminEvents events={this.props.events} error={this.props.error} createEvent={this.props.createEvent} created={this.props.eventCreated} createSuccess={this.props.eventCreateSuccess} /> }
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		events: state.Events.get('events'),
		error: state.Events.get('error'),
		eventCreated: state.Events.get('posted'),
		eventCreateSuccess: state.Events.get('postSuccess'),
		authenticated: state.Auth.get('authenticated'),
		isAdmin: state.Auth.get('isAdmin'),
		checkInSubmitted: state.CheckIn.get('submitted'),
		checkInPoints: state.CheckIn.get('numPoints'),
		checkInSuccess: state.CheckIn.get('success'),
		checkInError: state.CheckIn.get('error')
	};
};

const mapDispatchToProps = (dispatch)=>{
	return {
		fetchEvents: () => {
			dispatch(Action.GetCurrentEvents());
		},

		checkIn: (id) => {
			dispatch(Action.CheckInto(id));
		},

		resetCheckIn: () => {
			dispatch(Action.ResetCheckIn());
		},

		getTime: (input) => {
			dispatch(Action.TimeGet());
		},
	};
};


export default connect(mapStateToProps, mapDispatchToProps)(Events);
