import React from 'react';

import Button from 'components/Button';
import OverlayPopup from 'components/OverlayPopup'

export default class ControlPanelComponent extends React.Component {
	constructor(props){
		super(props);
		this.state = {input:'', showCreateAlert:false, showCreateResult:false};
		this.showCreateAlert = this.showCreateAlert.bind(this);
		this.hideCreateAlert = this.hideCreateAlert.bind(this);
		this.renderCreateAlert = this.renderCreateAlert.bind(this);
		this.showCreateResult = this.showCreateResult.bind(this);
		this.hideCreateResult = this.hideCreateResult.bind(this);
		this.renderCreateResult = this.renderCreateResult.bind(this);
		this.handleInput = this.handleInput.bind(this);
		this.handleCreate = this.handleCreate.bind(this);
	}

	showCreateAlert(){
		this.setState({showCreateAlert:true})
	}

	hideCreateAlert(){
		this.setState({showCreateAlert:false})
	}

	renderCreateAlert(){
		return (
			<OverlayPopup
				onCancel={this.hideCreateAlert}
				showing={this.state.showCreateAlert}
				title={"Warning: points will be reseted"}>
				<div className="popup-buttons">
					<Button className="popup-button popup-submit-button" style="blue" text="Confirm" onClick={this.handleCreate} />
					<Button className="popup-button popup-cancel-button" style="red" text="Cancel" onClick={this.hideCreateAlert}/>
				</div>
			</OverlayPopup>
		);
	}

	showCreateResult(){
		this.setState({showCreateResult:true});
	}

	hideCreateResult(){
		this.setState({showCreateResult:false});
	}

	renderCreateResult(){
		return(
			<OverlayPopup
				onCancel={this.hideCreateResult}
				showing={this.state.showCreateResult}
				title={this.props.createSuccess}>
				<div className="popup-buttons">
					<Button className="popup-button popup-submit-button" style="blue" text="Confirm" onClick={this.hideCreateResult} />
				</div>
			</OverlayPopup>
	);
	}

	handleInput(e){
		this.setState({input:e.target.value});
	}

	handleCreate(){
		this.hideCreateAlert();
		this.props.createMilestone(this.state.input);
		this.showCreateResult();
	}

	render() {
		return (

			<div className="control-panel-wrapper">
			{this.renderCreateAlert()}
			{this.renderCreateResult()}
				<h1>Control Panel</h1>
				<div className="form-elem">
						<Button
							className="signout-action-button"
							style="blue"
							text="Sign Out"
							onClick={this.props.logout}/>
						<Button
							className="deleteevents-action-button"
							style="red"
							text="Delete Events"/>
				</div>
				<div className="form-elem">
					<h1>Create a milestone</h1>
					<input type="text" name="name" placeholder="Quarter (e.g. Fall 2017)" onChange={this.handleInput}/>
				</div>
				<div className="form-elem">
					<Button
						className="control-panel-action-button"
						style="blue"
						text="Create"
						onClick={this.showCreateAlert}/>
				</div>

				<div className="form-elem">
					<h1 className="DisplayPrimary">Event Analytics</h1>
					<select className="Headline-2Secondary">
						<option>General</option>
						<option>AI</option>
						<option>Board</option>
						<option>Hack</option>
						<option>ICPC</option>
						<option>NetSec</option>
						<option>Studio</option>
						<option>W</option>
					</select>

				</div>
			</div>
		);
	}
}
