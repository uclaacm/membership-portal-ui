import React from 'react';
import Config from 'config';
import LoginSidebar from './loginSidebar';
import Modal from '../Modal';
import Button from '../Button';

export default class LoginComponent extends React.Component {
	constructor() {
		super();
		this.attendees = {
			attendees: ['Alex', 'Howard', 'Sana', 'Ani', 'Jen', 'Furn', 'Nikhil', 'Hirday', 'Hakan', 'Yvonne', 'Nathan']
		};
		this.state = {
			modalOpened: false
		};
		this.toggleModal = this.toggleModal.bind(this);
		this.onChange = this.onChange.bind(this);
	}

	toggleModal() {
		this.setState(prev => {
			let newState = Object.assign({}, prev);
            newState.modalOpened = !newState.modalOpened;
            return newState;
		})
	}

	onChange() {
		this.toggleModal();
	}
	
	render () {
		return (
			<div className="login">
				<Button style='green' text='Open Modal' onClick={this.toggleModal}/>
				<Modal attendees={JSON.stringify(this.attendees)} opened={this.state.modalOpened} onChange={this.onChange} style={{backgroundColor: 'white'}}/>
				<LoginSidebar onsubmit={this.props.onsubmit} error={this.props.error}/>
				<div className="login-tile">
					<div className="login-tile-inner" />
					 {/* style={{backgroundImage: 'url('+ Config.organization.loginTileBackground +')'}}></div> */}
				</div>
			</div>
		)
	}
}