import React from 'react';
import Button from '../Button';
import './style.scss';

export default class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.data = JSON.parse(this.props.attendees);
        this.state = {
            opened: true,
            data: this.data.attendees
        };
    }

    render() {
        return (
            this.props.opened && this.state.opened ? <div className='modal-wrapper'>
                <div className='modal-container' style={this.props.style ? this.props.style : null}>
                    <div style={{padding: '30px'}}>
                        <h1>Members</h1>
                        <br />
                        <div className='modal-table'>
                            <table style={{width: '100%'}}>
                                <thead>
                                    <tr><td>Name</td></tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.data.map((data, index) => 
                                            <tr key={index}>
                                                <td>{data}</td>
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                        <br />
                        <br />
                        <Button text='Close' style='red' onClick={() => this.props.onChange()}/>
                    </div>
                </div>
            </div>
            :null
        )
    }
}