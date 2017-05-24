import React, { PropTypes } from 'react'
import Button from 'components/Button/index';
import EarlierEventsIcon from 'components/Dashboard/earlierEventsIcon';
// import EventDay from './eventDay'
import AdminSingleEvent from './adminSingleEvent';
import AdminEventsHeader from './adminEventsHeader';
import AdminAddEventsForm from './adminAddEventsForm';

class AdminEvents extends React.Component {
    render () {
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
        const numEvents = allEvents.length;
        // console.log(allEvents);
        return(
            <div className="events-dashboard">
                <EarlierEventsIcon/>
                <Button className="checkin-button" style="blue event" icon="fa-plus" text="Add Event"/>
                <AdminEventsHeader/>                
                {
                    allEvents.map(function(evt, i) {
                        return  <div>
                                    <AdminSingleEvent fields={evt} key={i}/>
                                    <AdminAddEventsForm fields={evt} key={i+numEvents}/>
                                </div>
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