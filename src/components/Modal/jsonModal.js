import React from 'react';
import Button from '../Button';
import './style.scss';

export default class JSONModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: JSON.parse(this.props.attendees).members
        };
    }
    render() {
        return (
            <div className='modal-wrapper'>
                <div className='modal-container' style={this.props.style ? this.props.style : null}>
                    <div style={{padding: '30px'}}>
                        <h1>{this.props.title}</h1>
                        <br />
                        <div className='modal-table'>
                            <table style={{width: '100%'}}>
                                <thead>
                                    <tr>
                                        <td></td>
                                        <td>Name</td>
                                        <td>Year</td>
                                        <td>Major</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.data.map((member, index) => 
                                            <tr key={index}>
                                                <td><img src={member.picture} /></td>
                                                <td>{`${member.firstName} ${member.lastName}`}</td>
                                                <td>{member.year}</td>
                                                <td>{member.major}</td>
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
        )
    }
}