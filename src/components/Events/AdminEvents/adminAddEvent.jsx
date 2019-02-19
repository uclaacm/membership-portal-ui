import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

import InputElement from 'react-input-mask';
import DatePicker from 'react-datepicker';
import Button from 'components/Button/index';

import 'react-datepicker/dist/react-datepicker.css';
import Config from 'config';

export default class AdminAddEvent extends React.Component {
  constructor(props) {
    super(props);
    const { event } = this.props;
    this.state = { event, startTimeError: false, endTimeError: false };
    this.resizeTextArea = this.resizeTextArea.bind(this);
    this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
    this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
    this.handleChangeTime = this.handleChangeTime.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.event = nextProps.event;
      if (newState.event) newState.event.attendanceCode = nextProps.event.attendanceCode || '';
      return newState;
    });
  }

  resizeTextArea(e) {
    this.funcName = 'resizeTextArea';
    e.target.style.height = '5px';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  handleChangeStartDate(date) {
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.event.startDate = date;
      return newState;
    });
  }

  handleChangeEndDate(date) {
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.event.endDate = date;
      return newState;
    });
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.event[name] = value;
      return newState;
    });
  }

  handleSubmit() {
    const { onClickAdd } = this.props;
    const { endTimeError, startTimeError, event } = this.state;
    if (endTimeError || startTimeError) return;
    if (onClickAdd) onClickAdd(event);
  }

  handleChangeTime(e) {
    const name = e.target.name.split('Time')[0];
    const hh = (parseInt(e.target.value[0], 10) || 0) * 10 + (parseInt(e.target.value[1], 10) || 0);
    const mm = (parseInt(e.target.value[3], 10) || 0) * 10 + (parseInt(e.target.value[4], 10) || 0);
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState[`${name}TimeError`] = (Number.isNaN(hh) || hh > 23 || Number.isNaN(mm) || mm > 60);
      if (!newState[`${name}TimeError`]) {
        if (newState.event[`${name}Date`]) newState.event[`${name}Date`].set({ hour: hh, minute: mm });
        else {
          newState.event[`${name}Date`] = moment({ hour: hh, minute: mm });
        }
      }
      return newState;
    });
  }

  render() {
    const { showing, onClickCancel, isEdit } = this.props;
    const { event, startTimeError, endTimeError } = this.state;
    return (
      <div const className={`add-event-overlay${showing ? ' showing' : ''}`} onClick={onClickCancel}>
        <div className="event-sidebar" onClick={e => e.stopPropagation()}>
          <div className="cover-img">
            <img src={event.cover} alt="ACM" />
          </div>
          <div className="editor">
            <div className="input-row">
              <div className="input-field half-width">
                <p>Image URL</p>
                <input type="text" value={event.cover} name="cover" onChange={this.handleChange} />
              </div>
              <div className="input-field half-width">
                <p>Event URL</p>
                <input type="text" value={event.eventLink} name="eventLink" onChange={this.handleChange} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-field">
                <p>Event Title</p>
                <input type="text" value={event.title} name="title" onChange={this.handleChange} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-field">
                <p>Committee</p>
                <form>
                  <select onChange={this.handleChange}>
                    {
Config.committees.map(committee => <option value={committee.name}>{committee.name}</option>)
                    }
                  </select>
                </form>
              </div>
            </div>
            <div className="input-row">
              <div className="input-field half-width">
                <p>Attendance Code</p>
                <input type="text" value={event.attendanceCode} name="attendanceCode" onChange={this.handleChange} />
              </div>
              <div className="input-field half-width">
                <p>Attendance Points</p>
                <input type="text" value={event.attendancePoints} name="attendancePoints" onChange={this.handleChange} />
              </div>
            </div>
            <div className="divider" />
            <div className="input-row">
              <div className="input-field three-fourth-width">
                <p>Start Date</p>
                <DatePicker
                  selected={event.startDate}
                  onChange={this.handleChangeStartDate}
                  className="date-picker"
                />
              </div>
              <div className="input-field three-fourth-width">
                <p>Start Time</p>
                <InputElement
                  className={startTimeError ? 'error' : ''}
                  onChange={this.handleChangeTime}
                  mask="99:99"
                  name="startTime"
                  value={event.startDate ? event.startDate.format('HH:mm') : ''}
                />
              </div>
            </div>
            <div className="input-row">
              <div className="input-field three-fourth-width">
                <p>End Date</p>
                <DatePicker
                  selected={event.endDate}
                  onChange={this.handleChangeEndDate}
                  className="date-picker"
                />
              </div>
              <div className="input-field three-fourth-width">
                <p>End Time</p>
                <InputElement
                  className={endTimeError ? 'error' : ''}
                  onChange={this.handleChangeTime}
                  mask="99:99"
                  name="endTime"
                  value={event.endDate ? event.endDate.format('HH:mm') : ''}
                />
              </div>
            </div>
            <div className="input-row">
              <div className="input-field">
                <p>Event Location</p>
                <input type="text" value={event.location} name="location" onChange={this.handleChange} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-field">
                <p>Event Description</p>
                <textarea value={event.description} name="description" onChange={this.handleChange} onKeyUp={this.resizeTextArea} />
              </div>
            </div>
            <div className="button-area">
              <Button onClick={this.handleSubmit} color="green" text={isEdit ? 'Update' : 'Add'} icon="" />
              <Button onClick={onClickCancel} color="red" text="Cancel" icon="" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
AdminAddEvent.propTypes = {
  event: PropTypes.symbol.isRequired,
  onClickAdd: PropTypes.symbol.isRequired,
  showing: PropTypes.symbol.isRequired,
  onClickCancel: PropTypes.symbol.isRequired,
  isEdit: PropTypes.symbol.isRequired,
};
