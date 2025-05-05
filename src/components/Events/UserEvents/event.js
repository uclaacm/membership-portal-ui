import React from "react";
import { sanitize } from "dompurify";
import Button from "components/Button/index";

export default class EventCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selected: false };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    if (this.props.onClick) return this.props.onClick(e);
    this.setState(prev => ({
      selected: !prev.selected,
    }));
  }

  render() {
    const event = this.props.event;
    return (
      <div className="event-card" onClick={this.handleClick}>
        <div className="cover" style={{ backgroundImage: `linear-gradient(to bottom, #cce5ff, #005bea), url(${event.cover})` }}>
          <div className="points-container">
            <span className="points">{event.attendancePoints} PTS</span>
          </div>
          {this.props.event.checkedIn && (
            <div className="attended-container">
              <i className="fa fa-check-circle-o" />
              <span>Attended</span>
            </div>
          )}
        </div>
        <div className="content">
          <h2>{event.title}</h2>
          <span>
            {event.startDate.format("MMM D, YYYY, h:mm A")} &mdash; {event.endDate.format("h:mm A")}
          </span>
          <p className="location">{event.location}</p>
          <p className="committee">{event.committee}</p>
          <a className="event-link" href={event.eventLink} target="_blank" rel="noopener noreferrer">
            <Button small text="RSVP" />
          </a>
        </div>
      </div>
    );
  }
}
