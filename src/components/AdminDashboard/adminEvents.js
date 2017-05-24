import React, { PropTypes } from 'react'
import Button from 'components/Button/index';
import EarlierEventsIcon from 'components/Dashboard/earlierEventsIcon';
// import EventDay from './eventDay'
import AdminSingleEvent from './adminSingleEvent';
import AdminEventsHeader from './adminEventsHeader';
import AdminAddEventsForm from './adminAddEventsForm';

class AdminEvents extends React.Component {
    render () {
        // console.log(this.props.events);
        const fullEventsList = this.props.events;
        var allEvents = [];
        for(let i = 0; i < fullEventsList.length; i++) {
            var daysEvents = fullEventsList[i].events;
            var date = fullEventsList[i].date;
            for(let j = 0; j < daysEvents.length; j++) {
                daysEvents[j]["date"] = date;
                allEvents.push(daysEvents[j]);
            }
        }
        // console.log(allEvents);
        return(
            <div className="events-dashboard">
                <EarlierEventsIcon/>
                <Button className="checkin-button" style="blue event" icon="fa-plus" text="Add Event"/>
                <AdminAddEventsForm/>
                <AdminEventsHeader/>                
                {
                    allEvents.map(function(evt, i) {
                        return <AdminSingleEvent fields={evt} key={i}/>
                    })
                }
            </div>
        );
    }
}

export default AdminEvents;

                    // fullEventsList.map(function(singleDay, i) {
                    //     return <EventDay singleDayEventsList={singleDay} key={i}/>
                    // })