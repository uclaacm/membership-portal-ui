//Edited from components/Events/UserEvents/event.js
//To dynamically pull data, use components/Events/UserEvents/event.js as reference

import React from 'react'
import EventAnalytics from './eventAnalytics'
import Config from 'config'

export default class EventCard extends React.Component {
	//input: array of majors
	translate(majors) {

		const majorMap = Config.majorMap;

		const decideMajor = inputMajor => {
			for (let j = 0; j < majorMap.length; j++) {
				const { major, criteria } = majorMap[j];
				const output = criteria.find(({ val }) => inputMajor.match(val));
				if (output) {
					return major;
				}
			}
			return "Other"
		}

		let reducedMajors = majors.map(decideMajor);
		console.log(reducedMajors);
	}

	render() {

		this.translate(["computer science", "computer science and engineering", "electrical engineering", "mathematics of computation", "cognitive science", "linguistics and computer science", "math of computation", "applied mathematics", "undeclared engineering", "physics", "computer science & engineering", "computational and systems biology", "economics", "statistics", "mathematics", "bioengineering", "biochemistry", "mathematics/economics", "neuroscience", "chemistry", "mechanical engineering", "cs", "computer science engineering", "business economics", "cse", "civil engineering", "chemical engineering", "electrical and computer engineering", "math", "computational & systems biology", "computer engineering"]);

		const className = "event-card user-card";
        return(
			<div className={className}>
				<div className="content">
					<h2>THIS IS A VERY LONG EVENT TITLE THAT WILL OVERFLOW THE DIV</h2>
					<h3>Event Committee</h3>



					<div className="points-container">
						<div className="points Headline-2Secondary">100</div>
						<div className="label SubheaderSecondary">attendees</div>
					</div>



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
