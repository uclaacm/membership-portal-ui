import React from 'react';
import Button from '../Button';
import './style.scss';

export default class ConfirmationModal extends React.Component {
    render() {
        return (
            <div className='modal-wrapper'>
                <div className='confirmation-modal-container' style={this.props.style ? this.props.style : null}>
                    <div style={{padding: '30px'}}>
                        <h1>{this.props.title}</h1>
                        <br />
                        <p>{this.props.message}</p>
                        <br />
                        <br />
                        <div className='button-container'>
                            <div style={{paddingRight: '20px'}}>
                                <Button text='Yes' style='green' onClick={() => this.props.submit()} />
                            </div>
                            <div style={{paddingLeft: '20px'}}>
                                <Button text='No' style='red' onClick={() => this.props.cancel()} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}