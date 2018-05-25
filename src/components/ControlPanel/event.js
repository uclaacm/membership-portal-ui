import React from 'react'
import EventAnalytics from './eventAnalytics'
import Config from 'config'
import { translate } from 'utils'

export default class EventCard extends React.Component {

	render() {
		const yearData = { 1: 100, 2: 50, 3: 25, 4: 10, 5: 3 };
		const majorData= { "CS/CSE": 300, "Ling CS": 100, "Math": 25 };

		return(
			<div className="event-card user-card">
				<div className="content">
					<h2>Event Title</h2>
					<h3>Event Committee</h3>

					<div className="points-container">
						<div className="points Headline-2Secondary">100</div>
						<div className="label SubheaderSecondary">attendees</div>
					</div>

					<div className="subcontent">
						<span className="time">7:00 am — 11:00 am</span>
						<p className="location">Event Location</p>
					</div>

					<EventAnalytics yearData={yearData} majorData={majorData} />
				</div>
			</div>
		);
	}
}
