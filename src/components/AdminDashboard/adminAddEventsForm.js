import React, { PropTypes } from 'react'
// import EventTile from './eventTile'
// import EventDropdown from './eventDropdown'
import Button from 'components/Button/index';

class AdminAddEventsForm extends React.Component {
    render () {
      console.log("EventDay", this.props.fields);
    //   const numEvents = this.props.singleDayEventsList.events.length;
    //   const eventsForTheDay = this.props.singleDayEventsList.events;
     
        return(
            <div className="admin-add-event-form">
                <form>
                    <div className="event-tile">
                        <div className="event-info-wrapper">
                            <div className="img-wrapper">
                                <img className="event-img" />
                            </div>
                            <div className="event-info-left">
                                <span className="event-info Title-2Secondary">ACM</span><br></br>
                                <input className="event-info Headline-2Primary title" defaultValue="Implicit Bias Workshop"></input>
                            </div>
                            <div className="event-info-right">
                                <div className="event-info">
                                    <i className="fa fa-calendar event-icon" aria-hidden="true"></i>
                                    <input className="Subheader-2Secondary" defaultValue="May 23rd, 2017"></input>  
                                </div>
                                <div className="event-info">
                                    <i className="fa fa-clock-o event-icon" aria-hidden="true"></i>
                                    <input className="Subheader-2Secondary" defaultValue="6:00pm-7:00pm"></input>
                                </div>
                                <div className="event-info">
                                    <i className="fa fa-map-marker event-icon" aria-hidden="true"></i>
                                    <input className="Subheader-2Secondary" defaultValue="Boelter 4760"></input>  
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="event-dropdown">
                        <div className="event-top">
                            <div className="dropdown-left">
                                <span className="Title-2Secondary points-span">Points</span>
                                <input className="event-points-val Display-2Secondary points-input"></input>
                                <Button className="event-button" style="event-button" icon="fa-facebook-square" text="Event Page"/>
                                <Button className="event-button" style="event-button" icon="fa-file" text="Resources"/>
                            </div>
                            <div className="dropdown-right">
                                <textarea className="Subheader-2Secondary description">Description of the event will go here. Description of the event will go here. Description of the event will go here. Description of the event will go here. Description of the event will go here. Description of the event will go here. Description of the event will go here. Description of the event will go here. Description of the event will go here.</textarea> 
                            </div>
                        </div>
                        <div className="minimize">
                            <i className="fa fa-chevron-up fa-3x minimize-icon" aria-hidden="true"></i>
                        </div>
                    </div>

                </form>
            </div>
        );
    }
}

export default AdminAddEventsForm;


