import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';

/*
      attendancePoints: "",
      committee: "",
      cover: "",
      description: "",
      endDate: "", // endTime
      eventLink: "",
      location: "",
      startDate: "", // startTime
      title: "",
      startTime: "",
*/
const EventCard = ({ event }) => {
  let formattedStartDate = '';
  let formattedStartTime = '';
  if (event.startDate) {
    formattedStartDate = event.startDate.format('MMMM D, YYYY');
    formattedStartTime = event.startDate.format('h:mm a');
  }

  let formattedEndTime = '';
  if (event.endDate) {
    formattedEndTime = event.endDate.format('h:mm a');
  }

  return (
    <>
      <div className="event-container">
        <div className="image-container">
          <div className="cover" style={{ backgroundImage: `url(${event.cover})` }}> </div>
          <div className="pill-shape points-container">
            {event.attendancePoints}
            {' '}
            PTS
          </div>
        </div>

        <div className="text-container">
          <p className="event-title">{event.title}</p>
          <p className="text">
            {formattedStartDate}
            ,
            {' '}
            {formattedStartTime}
            &mdash;
            {formattedEndTime}
          </p>
          <p className="text">{event.location}</p>
          <p className="text">{event.committee}</p>
          <div className="pill-shape rsvp">RSVP</div>
        </div>
      </div>
    </>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    attendancePoints: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    committee: PropTypes.string,
    cover: PropTypes.string,
    description: PropTypes.string,
    endDate: PropTypes.shape({
      format: PropTypes.func.isRequired,
    }),
    eventLink: PropTypes.string,
    location: PropTypes.string,
    startDate: PropTypes.shape({
      format: PropTypes.func.isRequired,
    }),
    title: PropTypes.string,
    startTime: PropTypes.string,
  }).isRequired,
};

export default EventCard;
