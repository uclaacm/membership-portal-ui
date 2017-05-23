import React, { PropTypes } from 'react';

import Config from 'config';
import Organization from './organization';
import Points from './points';
import Username from './username';
import ProfilePicture from './profilePicture';
import Checkin from './checkin';
import Leaderboard from './leaderboard';
import Settings from './settings';
import Position from './position';
import Navigation from './navigation';
import Bar from './bar';

class Sidebar extends React.Component {
    render () {

//Example use for user page
//<Sidebar propic="https://pbs.twimg.com/profile_images/821079138060496896/7yR9rQOY.jpg" org="UCLA DevX "username="Akhil Nadendla" pos="Admin" isAdmin={true}/>
//Example use for admin page
//<Sidebar propic="https://pbs.twimg.com/profile_images/821079138060496896/7yR9rQOY.jpg" username="UCLA ACM" pos="Admin" isAdmin={true}/>


        return(
            <div className="sidebar">
                <div className="sidebar-container">
                    <i className="settings-img fa fa-cog fa-2x"></i>
                    <ProfilePicture pic={this.props.propic}/>
                    {this.props.org && <Organization org={this.props.org} />}
                    <Username username={this.props.username} />
                    <Position pos={this.props.pos}/>
                    <Navigation/>
                    {!this.props.isAdmin && <Points levelClass="Hacker" levelNumber="2" points="10" />}
                    {this.props.isAdmin && <Bar/>}
                    {/*<Leaderboard/>*/}
                </div>
            </div>
        )
    }
}

export default Sidebar;
