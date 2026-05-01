'use client';

import React from 'react';
import PropTypes from 'prop-types';

import Button from '@/components/Button';
import Toast from '@/components/Toast';
import EarlierEventsIcon from '@/app/events/earlierEventsIcon';
import EventMonth from './eventMonth';
import AdminAddEvent from './adminAddEvent';

export default class AdminEvents extends React.Component {
  constructor(props) {
    super(props);
    this.emptyEvent = {
      attendancePoints: '',
      attendanceCode: '',
      committee: '',
      cover: '',
      description: '',
      endDate: '',
      eventLink: '',
      location: '',
      startDate: '',
      title: '',
      startTime: '',
    };

    this.state = {
      showAddEvent: false,
      isEditEvent: false,
      eventPlaceholder: this.emptyEvent,
      showEarlierEvents: false,
    };

    this.showAddEvent = this.showAddEvent.bind(this);
    this.hideAddEvent = this.hideAddEvent.bind(this);
    this.addEvent = this.addEvent.bind(this);
    this.cancelAddEventParent = this.cancelAddEventParent.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
  }

  showAddEvent(e) {
    this.setState(prev => ({
      showAddEvent: true,
      isEditEvent: false,
      eventPlaceholder: this.emptyEvent,
    }));
  }

  hideAddEvent(e) {
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.showAddEvent = false;
      return newState;
    });
  }

  showEarlierEvents() {
    this.setState({
      showAddEvent: this.state.showAddEvent,
      isEditEvent: this.state.isEditEvent,
      eventPlaceholder: this.state.eventPlaceholder,
      showEarlierEvents: true,
    });
  }

  addEvent(event) {
    if (event.uuid) {
      this.props.updateEvent(event);
    } else {
      this.props.addEvent(event);
    }
  }

  cancelAddEventParent(e) {
    this.setState(prev => ({
      showAddEvent: false,
    }));
  }

  handleEditClick(param) {
    this.setState(prev => ({
      showAddEvent: true,
      isEditEvent: true,
      eventPlaceholder: param,
    }));
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const isUpdateComplete = nextProps.updated && nextProps.updateSuccess;
    const isCreateComplete = nextProps.created && nextProps.createSuccess;
    const isSyncComplete = nextProps.synced && nextProps.syncSuccess;
    const isDeleteComplete = nextProps.deleted && nextProps.deleteSuccess;

    if (isUpdateComplete || isCreateComplete || isSyncComplete || isDeleteComplete) {
      this.setState(prev => ({
        showAddEvent: false,
        isEditEvent: false,
      }));
    }
  }

  render() {
    const { events } = this.props;
    const months = [];
    let i = 0;

    while (i < events.length) {
      const month = { date: events[i].startDate, days: [] };
      while (i < events.length && events[i].startDate.month() === month.date.month()) {
        if (month.days.length === 0 || events[i].startDate.date() !== month.days[month.days.length - 1].date.date()) month.days.push({ date: events[i].startDate, events: [events[i]] });
        else month.days[month.days.length - 1].events.push(events[i]);
        i++;
      }
      months.push(month);
    }

    const thisMonth = new Date();
    thisMonth.setHours(0, 0, 0, 0);
    thisMonth.setDate(1);
    const pastMonths = months.filter(month => month.date < thisMonth);
    const futureMonths = months.filter(month => month.date >= thisMonth);

    const {
      deleted,
      deleteSuccess,
      deleteWasSeries,
      updated,
      updateSuccess,
      repeatedSeriesUpdate,
      created,
      createSuccess,
      repeatedSeriesCreate,
      synced,
      syncSuccess,
      syncMessage,
      error,
    } = this.props;

    let bannerMessage = error;
    if (deleted) {
      bannerMessage = deleteSuccess
        ? (deleteWasSeries ? 'Events deleted successfully' : 'Event deleted successfully')
        : error;
    } else if (updated) {
      bannerMessage = updateSuccess
        ? (repeatedSeriesUpdate ? 'Events updated successfully' : 'Event updated successfully')
        : error;
    } else if (created) {
      bannerMessage = createSuccess
        ? (repeatedSeriesCreate ? 'Repeated events created successfully' : 'Event created successfully')
        : error;
    } else if (synced) {
      bannerMessage = syncSuccess
        ? (syncMessage || 'Events synced successfully from Google Sheets')
        : error;
    }

    return (
      <div className="events-dashboard admin-dashboard">
        <Toast
          showing={!!updated || !!created || !!synced || !!deleted}
          success={!!(updateSuccess || createSuccess || syncSuccess || deleteSuccess)}
          message={bannerMessage}
        />
        <AdminAddEvent
          event={this.state.eventPlaceholder}
          onClickAdd={this.addEvent}
          onClickCancel={this.cancelAddEventParent}
          onCreateRepeated={this.props.addRepeatedEvent}
          onUpdateRepeatedGroup={this.props.updateRepeatedGroup}
          onDeleteEvent={this.props.deleteAdminEvent}
          onLoadRepeatedGroup={this.props.loadRepeatedGroup}
          isEdit={this.state.isEditEvent}
          showing={this.state.showAddEvent}
        />

        {!this.state.showAddEvent && (
          <Button
            className="checkin-button"
            style="blue"
            icon="fa-plus"
            text="Add Event"
            onClick={this.showAddEvent}
          />
        )}

        {!this.state.showEarlierEvents && (
          <EarlierEventsIcon
            onClick={() => {
              this.showEarlierEvents();
            }}
          />
        )}
        {this.state.showEarlierEvents
          && pastMonths.map((month, idx) => (
            <EventMonth month={month} key={month.date.toString()} handleEditClick={this.handleEditClick} />
          ))}

        {futureMonths.map((month, idx) => (
          <EventMonth month={month} key={month.date.toString()} handleEditClick={this.handleEditClick} />
        ))}
      </div>
    );
  }
}

AdminEvents.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  isAdmin: PropTypes.bool,
  isOfficer: PropTypes.bool,
  error: PropTypes.string,
  created: PropTypes.bool,
  createSuccess: PropTypes.bool,
  repeatedSeriesCreate: PropTypes.bool,
  updated: PropTypes.bool,
  updateSuccess: PropTypes.bool,
  repeatedSeriesUpdate: PropTypes.bool,
  deleted: PropTypes.bool,
  deleteSuccess: PropTypes.bool,
  deleteWasSeries: PropTypes.bool,
  synced: PropTypes.bool,
  syncSuccess: PropTypes.bool,
  syncMessage: PropTypes.string,
  addEvent: PropTypes.func.isRequired,
  addRepeatedEvent: PropTypes.func.isRequired,
  updateEvent: PropTypes.func.isRequired,
  updateRepeatedGroup: PropTypes.func.isRequired,
  deleteAdminEvent: PropTypes.func.isRequired,
  loadRepeatedGroup: PropTypes.func.isRequired,
};

AdminEvents.defaultProps = {
  repeatedSeriesCreate: false,
  repeatedSeriesUpdate: false,
  deleted: false,
  deleteSuccess: false,
  deleteWasSeries: false,
};
