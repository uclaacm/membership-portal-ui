//Edited from components/Events/UserEvents/event.js
//To dynamically pull data, use components/Events/UserEvents/event.js as reference

import React from 'react'
import EventAnalytics from './eventAnalytics'

export default class EventCard extends React.Component {
	render() {
		const className = "event-card user-card";
        return(
			<div className={className}>
				<div className="content">
					<h2>Event Title</h2>
					<h3>Event Committee</h3>
					<div className="subcontent">
						<span className="time">7:00 am — 11:00 am</span>
						<p className="location">Event Location</p>
					</div>
                    <EventAnalytics />
				</div>
			</div>
		);
	}
}
