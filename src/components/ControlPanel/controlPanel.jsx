import React from 'react';
import Button from 'components/Button';
import BannerMessage from 'components/BannerMessage';
import EventsModal from 'components/Modal/eventsModal';
import ImagesModal from 'components/Modal/imagesModal';
import AdminsModal from 'components/Modal/adminsModal';
import ReassignModal from 'components/Modal/reassignModal';
import OneClickPasswordModal from 'components/Modal/oneClickPasswordModal';
import ConfirmationModal from 'components/Modal/confirmationModal';
import PropTypes from 'prop-types';
import ChangeToAdmin from '../Profile/ChangeToAdmin';


class ControlPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      // Delete events
      showEventsModal: false,
      showEventsConfirmationModal: false,
      deleteUUID: null,

      // Delete images
      showImagesModal: false,
      showImagesConfirmationModal: false,
      deleteImageUUID: null,

      // Manage admins
      showAdminsModal: false,
      showReassignModal: false,
      showRemoveAdminConfirmationModal: false,
      showReassignAdminConfirmationModal: false,
      removeEmail: null,
      reassignEmail: null,

      showOneClickPasswordModal: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.oneClickUpdated && nextProps.oneClickUpdateSuccess) {
      this.closeOneClickPasswordModal();
    }
  }

  openEventsModal = () => {
    this.setState({ showEventsModal: true });
  };

  closeEventsModal = () => {
    this.setState({ showEventsModal: false });
  };

  openEventsConfirmationModal = (uuid) => {
    this.setState({ showEventsConfirmationModal: true, deleteUUID: uuid });
  };

  closeEventsConfirmationModal = () => {
    this.setState({ showEventsConfirmationModal: false });
  };

  openImagesModal = () => {
    this.setState({ showImagesModal: true });
  };

  closeImagesModal = () => {
    this.setState({ showImagesModal: false });
  };

  openImagesConfirmationModal = (uuid) => {
    this.setState({ showImagesConfirmationModal: true, deleteImageUUID: uuid });
  };

  closeImagesConfirmationModal = () => {
    this.setState({ showImagesConfirmationModal: false });
  };

  openAdminsModal = () => {
    this.setState({ showAdminsModal: true });
  };

  closeAdminsModal = () => {
    this.setState({ showAdminsModal: false });
  };

  openReassignModal = () => {
    this.setState({ showReassignModal: true });
  };

  closeReassignModal = () => {
    this.setState({ showReassignModal: false });
  };

  openRemoveAdminConfirmationModal = (email) => {
    this.setState({ showRemoveAdminConfirmationModal: true, removeEmail: email });
  };

  closeRemoveAdminConfirmationModal = () => {
    this.setState({ showRemoveAdminConfirmationModal: false });
  };

  openReassignAdminConfirmationModal = (email) => {
    this.setState({ showReassignAdminConfirmationModal: true, reassignEmail: email });
  };

  closeReassignAdminConfirmationModal = () => {
    this.setState({ showReassignAdminConfirmationModal: false });
  };

  openOneClickPasswordModal = () => {
    this.setState({ showOneClickPasswordModal: true });
  };

  closeOneClickPasswordModal = () => {
    this.setState({ showOneClickPasswordModal: false });
  };

  triggerDeleteEvent = () => {
    const { deleteEvent } = this.props;
    const { deleteUUID } = this.state;
    deleteEvent(deleteUUID);
    this.closeEventsConfirmationModal();
  };

  triggerDeleteImage = () => {
    const { deleteImage } = this.props;
    const { deleteImageUUID } = this.state;
    deleteImage(deleteImageUUID);
    this.closeImagesConfirmationModal();
  };

  triggerRemoveAdmin = () => {
    const { removeAdmin } = this.props;
    const { removeEmail } = this.state;
    removeAdmin(removeEmail);
    this.closeRemoveAdminConfirmationModal();
  };

  triggerReassignAdmin = () => {
    const { reassignAdmin } = this.props;
    const { reassignEmail } = this.state;
    reassignAdmin(reassignEmail);
    this.closeReassignAdminConfirmationModal();
  };

  triggerAddAdmin = (email) => {
    const { addAdmin } = this.props;
    addAdmin(email);
  };

  triggerChangePassword = (oldPassword, newPassword) => {
    const { changeOneClickPassword } = this.props;
    changeOneClickPassword(oldPassword, newPassword);
  };

  render() {
    const {
      logout, events, admins, images, isSuperAdmin, userEmail, adminView, toggleAdminView,
    } = this.props;
    const {
      showEventsModal,
      showEventsConfirmationModal,

      showImagesModal,
      showImagesConfirmationModal,

      showAdminsModal,
      showReassignModal,
      showRemoveAdminConfirmationModal,
      showReassignAdminConfirmationModal,

      showOneClickPasswordModal,
    } = this.state;

    return (
      <div className="control-panel-wrapper">
        <BannerMessage
          showing={this.props.oneClickUpdated}
          success={this.props.oneClickUpdateSuccess}
          message={this.props.oneClickUpdateSuccess ? 'Password updated successfully' : this.props.oneClickError}
        />
        <h1 className="DisplayPrimary">Control Panel</h1>
        <div className="form-elem">
          <Button className="signout-action-button" color="blue" text="Sign Out" onClick={logout} />
          <br />
          <Button
            className="deleteevents-action-button"
            color="red"
            text="Delete Events"
            onClick={this.openEventsModal}
          />
          <br />

          <Button
            className="manageimages-action-button"
            color="red"
            text="Manage Images"
            onClick={this.openImagesModal}
          />
          <br />

          <Button
            className="control-panel-action-button"
            color="red"
            text="Manage One-Click API"
            onClick={this.openOneClickPasswordModal}
          />
          <br />

          <Button
            className="control-panel-action-button"
            color="blue"
            text={adminView ? 'Switch to Member View' : 'Switch to Admin View'}
            onClick={toggleAdminView}
          />

          <ChangeToAdmin />
          <br />

          {isSuperAdmin ? (
            <Button
              className="control-panel-action-button"
              color="red"
              text="Manage Admins"
              onClick={this.openAdminsModal}
            />
          ) : (
            <></>
          )}
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

        <ImagesModal
          opened={showImagesModal}
          images={images}
          onDelete={this.openImagesConfirmationModal}
          onClose={this.closeImagesModal}
        />

        <ConfirmationModal
          title="Delete Event"
          message="Are you sure you want to delete this event? This can't be undone!"
          opened={showEventsConfirmationModal}
          cancel={this.closeEventsConfirmationModal}
          submit={this.triggerDeleteEvent}
        />

        <ConfirmationModal
          title="Delete Image"
          message="Are you sure you want to delete this image? This can't be undone!"
          opened={showImagesConfirmationModal}
          cancel={this.closeImagesConfirmationModal}
          submit={this.triggerDeleteImage}
        />

        {isSuperAdmin ? (
          <>
            <AdminsModal
              opened={showAdminsModal}
              userEmail={userEmail}
              admins={admins}
              onAdd={this.triggerAddAdmin}
              onRemove={this.openRemoveAdminConfirmationModal}
              onReassign={this.openReassignModal}
              onClose={this.closeAdminsModal}
            />

            <ReassignModal
              opened={showReassignModal}
              onReassign={this.openReassignAdminConfirmationModal}
              onClose={this.closeReassignModal}
              admins={admins}
            />

            <ConfirmationModal
              title="Remove Admin"
              message="Are you sure you want to remove this admin?"
              opened={showRemoveAdminConfirmationModal}
              cancel={this.closeRemoveAdminConfirmationModal}
              submit={this.triggerRemoveAdmin}
            />

            <ConfirmationModal
              title="Reassign Super Admin"
              message="Are you sure you want to reassign super admin?"
              opened={showReassignAdminConfirmationModal}
              cancel={this.closeReassignAdminConfirmationModal}
              submit={this.triggerReassignAdmin}
            />
          </>
        ) : (
          <></>
        )}

        <OneClickPasswordModal
          opened={showOneClickPasswordModal}
          onClose={this.closeOneClickPasswordModal}
          onChange={this.triggerChangePassword}
        />
      </div>
    );
  }
}

ControlPanel.propTypes = {
  logout: PropTypes.func.isRequired,
  deleteEvent: PropTypes.func.isRequired,
  removeAdmin: PropTypes.func.isRequired,
  reassignAdmin: PropTypes.func.isRequired,
  addAdmin: PropTypes.func.isRequired,
  events: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string,
    title: PropTypes.string,
  })).isRequired,
  admins: PropTypes.arrayOf(PropTypes.shape({
    email: PropTypes.string,
    firstName: PropTypes.string,
  })).isRequired,
  images: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string,
  })).isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  userEmail: PropTypes.string.isRequired,
  changeOneClickPassword: PropTypes.func.isRequired,
  oneClickUpdated: PropTypes.bool.isRequired,
  oneClickUpdateSuccess: PropTypes.bool.isRequired,
  oneClickError: PropTypes.string.isRequired,
  adminView: PropTypes.bool.isRequired,
  toggleAdminView: PropTypes.func.isRequired,
};

export default ControlPanel;
