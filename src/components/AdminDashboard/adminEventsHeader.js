import React, { PropTypes } from 'react'
// import EventTile from './eventTile'
// import EventDropdown from './eventDropdown'

class AdminEventsHeader extends React.Component {
    render () {
    //   const numEvents = this.props.singleDayEventsList.events.length;
    //   const eventsForTheDay = this.props.singleDayEventsList.events;
        return(
            <div className="table-header">
                    <span className="Body-2Primary col title header-offset">Event Title</span>
                    <span className="Body-2Primary col org">Committee</span>
                    <span className="Body-2Primary col time">Time</span>
                    <span className="Body-2Primary col location">Location</span>
                    <span className="Body-2Primary col pts">Points</span>
            </div>
        );
    }
}

export default AdminEventsHeader;


