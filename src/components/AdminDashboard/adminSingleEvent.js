import React, { PropTypes } from 'react'
// import EventTile from './eventTile'
// import EventDropdown from './eventDropdown'

class AdminSingleEvent extends React.Component {
    render () {
        // console.log("EventDay", this.props.fields);
        var past = (this.props.fields.date == "Wednesday, April 19th");       //can have some easy check
        var fontClass;
        if(past) {
            fontClass = "Disabled";
        }
        else {
            fontClass = "Secondary";
        }
        {"generic-button " + this.props.style}
        return(
            <div className="admin-event-day">     
                <i className="fa fa-pencil col icon" aria-hidden="true"></i>
                <span className="col"><img className="img" src={this.props.fields.img}/></span>
                <span className={"Body-2" + fontClass + " col title"}>{this.props.fields.title}</span>
                <span className={"Body" + fontClass + " col org"}>{this.props.fields.org}</span>
                <span className={"Body" + fontClass + " col time"}>{this.props.fields.time}</span>
                <span className={"Body" + fontClass + " col location"}>{this.props.fields.location}</span>
                <span className={"Body" + fontClass + " col pts"}>{this.props.fields.attendancePoints}</span>
                {/*<p className="title">{this.props.fields.title}</p>
                <p className="org">{this.props.fields.org}</p>
                <p className="time">{this.props.fields.time}</p>
                <p className="location">{this.props.fields.location}</p>*/}
            </div>
        );
    }
}

export default AdminSingleEvent;


