import React from 'react';
import {connect} from 'react-redux';
import {replace} from 'react-router-redux';

import {Action} from 'reducers';
import ControlPanelComponent from 'components/ControlPanel';

import moment from 'moment';

class ControlPanel extends React.Component {
	constructor(props) {
		super(props);
	}

	componentWillMount() {
		if (!this.props.isAdmin) {
			return this.props.redirectHome();
		}
	}

	componentWillReceiveProps(nextProps) {
		if (!nextProps.isAdmin) {
			return nextProps.redirectHome();
		}
		if (nextProps.created){
			setTimeout(() => {
				this.props.createMilestoneDone();
			}, 250);
		}
	}

	render() {
		if (this.props.createSuccess) {
			return <ControlPanelComponent logout={this.props.logout}
																		createMilestone={this.props.createMilestone}
																		createSuccess={"Milestone successfully created"}
							 											/>;
		} else {
			return <ControlPanelComponent logout={this.props.logout}
																		createMilestone={this.props.createMilestone}
																		createSuccess={"Error: Can't create milestone"}
							 											/>;
		}
	}
}

const mapStateToProps = (state)=>{
	return {
		authenticated: state.Auth.get("authenticated"),
		isAdmin: state.Auth.get('isAdmin'),
		created: state.Milestone.get('created'),
		createSuccess: state.Milestone.get('createSuccess')
	};
};

const mapDispatchToProps = (dispatch)=>{
	return {
		redirectHome: () => {
			dispatch(replace('/'));
		},

		logout: () => {
			dispatch(Action.LogoutUser());
		},

		createMilestone:name =>{
			dispatch(Action.CreateMilestone(name));
		},

		createMilestoneDone: ()=>{
			dispatch(Action.CreateMilestoneDone());
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);
