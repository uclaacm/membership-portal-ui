import React from 'react';
import ConfirmationModal from './confirmationModal';
import JSONModal from './jsonModal';
import './style.scss';

export default class Modal extends React.Component {
    render() {
        if (this.props.opened) {
            if (this.props.type === 'confirmation') {
                return <ConfirmationModal 
                            onChange={this.props.onChange}
                            title={this.props.title}
                            message={this.props.message}
                            submit={this.props.submit}
                            cancel={this.props.cancel}
                            />
            } else if (this.props.type === 'json') {
                return <JSONModal 
                            onChange={this.props.onChange} 
                            title={this.props.title} 
                            attendees={this.props.attendees} 
                            />
            }
        } 
        return null;
    }
}