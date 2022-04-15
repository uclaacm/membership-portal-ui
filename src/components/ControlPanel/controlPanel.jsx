import React from 'react';
import Button from 'components/Button';
import EventsModal from 'components/Modal/eventsModal';
import AdminsModal from 'components/Modal/adminsModal';
import OneClickPasswordModal from 'components/Modal/oneClickPasswordModal';
import ConfirmationModal from 'components/Modal/confirmationModal';
import PropTypes from 'prop-types';

class ControlPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      showEventsModal: false,
      showEventsConfirmationModal: false,
      deleteUUID: null,
      showAdminsModal: false,
      showAdminsConfirmationModal: false,
      deleteEmail: null,
      showOneClickPasswordModal: false,
    };
  }

  openEventsModal = () => {
    this.setState(prev => ({ showEventsModal: true }));
  }

  closeEventsModal = () => {
    this.setState(prev => ({ showEventsModal: false }));
  }

  openEventsConfirmationModal = (uuid) => {
    this.setState(prev => ({ showEventsConfirmationModal: true, deleteUUID: uuid }));
  }

  closeEventsConfirmationModal = () => {
    this.setState(prev => ({ showEventsConfirmationModal: false }));
  }

  openAdminsModal = () => {
    this.setState(prev => ({ showAdminsModal: true }));
  }

  closeAdminsModal = () => {
    this.setState(prev => ({ showAdminsModal: false }));
  }

  openAdminssConfirmationModal = (email) => {
    this.setState(prev => ({ showAdminsConfirmationModal: true, deleteEmail: email }));
  }

  closeAdminssConfirmationModal = () => {
    this.setState(prev => ({ showAdminsConfirmationModal: false }));
  }

  openOneClickPasswordModal = () => {
    this.setState(prev => ({ showOneClickPasswordModal: true }));
  }

  closeOneClickPasswordModal = () => {
    this.setState(prev => ({ showOneClickPasswordModal: false }));
  }

  triggerDeleteEvent = () => {
    const { deleteEvent } = this.props;
    const { deleteUUID } = this.state;
    deleteEvent(deleteUUID);
    this.closeEventsConfirmationModal();
  }

  triggerDeleteAdmin = () => {
    const { deleteAdmin } = this.props;
    const { deleteEmail } = this.state;
    deleteAdmin(deleteEmail);
    this.closeAdminsConfirmationModal();
  }

  triggerAddAdmin = () => {
    // TODO
  }

  render() {
    const { logout, events, admins, isSuperAdmin } = this.props;
    const { showEventsModal, showEventsConfirmationModal, showAdminsModal, showAdminsConfirmationModal, showOneClickPasswordModal } = this.state;
    return (

      <div className="control-panel-wrapper">
        <h1 className="DisplayPrimary">Control Panel</h1>
        <div className="form-elem">
          <Button
            className="signout-action-button"
            color="blue"
            text="Sign Out"
            onClick={logout}
          />

          <Button
            className="deleteevents-action-button"
            color="red"
            text="Delete Events"
            onClick={this.openEventsModal}
          />

          {isSuperAdmin ? 
            <Button
              className="control-panel-action-button"
              color="red"
              text="Edit Admins"
              onClick={this.openAdminsModal}
            />: <></>}

          <Button
            className="control-panel-action-button"
            color="red"
            text="Change One-Click API Password"
            onClick={this.openOneClickPasswordModal}
          />
        </div>

        {/* This input and button don't do anything? */}
        {/*
        <div className="form-elem">
          <h1>Create a milestone</h1>
          <input type="text" name="name" placeholder="Quarter (e.g. Fall 2017)" />
        </div>
        <div className="form-elem">
          <Button
            className="control-panel-action-button"
            color="blue"
            text="Create"
          />
        </div>
        */}

        {/* Event analytics were never implemented? */}
        {/*
        <div className="form-elem">
          <h1>Event analytics</h1>
          <select className="Headline-2Secondary">
            <option>General</option>
            <option>AI</option>
            <option>Board</option>
            <option>Cyber</option>
            <option>Design</option>
            <option>Hack</option>
            <option>ICPC</option>
            <option>Studio</option>
            <option>TeachLA</option>
            <option>W</option>
          </select>
        </div>
        */}

        <EventsModal
          opened={showEventsModal}
          events={events}
          onDelete={this.openEventsConfirmationModal}
          onClose={this.closeEventsModal}
        />

        <ConfirmationModal
          title="Delete Event"
          message="Are you sure you want to delete this event? This can't be undone!"
          opened={showEventsConfirmationModal}
          cancel={this.closeEventsConfirmationModal}
          submit={this.triggerDeleteEvent}
        />

        {isSuperAdmin ? 
        <>
          <AdminsModal
            opened={showAdminsModal}
            admins={admins}
            onAdd={this.triggerAddAdmin}
            onDelete={this.openAdminsConfirmationModal}
            onClose={this.closeAdminsModal}
          />

          <ConfirmationModal
            title="Remove Admin"
            message="Are you sure you want to remove this admin?"
            opened={showAdminsConfirmationModal}
            cancel={this.closeAdminsConfirmationModal}
            submit={this.triggerDeleteAdmin}
          />
        </> : <></>}

        <OneClickPasswordModal
            opened={showOneClickPasswordModal}
            onClose={this.closeOneClickPasswordModal}
        />
      </div>
    );
  }
}

ControlPanel.propTypes = {
  logout: PropTypes.func.isRequired,
  deleteEvent: PropTypes.func.isRequired,
  deleteAdmin: PropTypes.func.isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  admins: PropTypes.arrayOf(PropTypes.object).isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
};

export default ControlPanel;
