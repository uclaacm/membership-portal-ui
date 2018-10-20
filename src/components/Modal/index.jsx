import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationModal from './confirmationModal';
import JSONModal from './jsonModal';
import './style.scss';

export default class Modal extends React.Component {
  render() {
    const {
      opened, type, onChange, title, message, submit, cancel, attendees,
    } = this.props;
    if (opened) {
      if (type === 'confirmation') {
        return (
          <ConfirmationModal
            onChange={onChange}
            title={title}
            message={message}
            submit={submit}
            cancel={cancel}
          />
        );
      }
      if (type === 'json') {
        return (
          <JSONModal
            onChange={onChange}
            title={title}
            attendees={attendees}
          />
        );
      }
    }
    return null;
  }
}

Modal.defaultProps = {
  submit: undefined,
  cancel: undefined,
  attendees: undefined,
  message: undefined,
};

Modal.propTypes = {
  opened: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  submit: PropTypes.func,
  cancel: PropTypes.func,
  attendees: PropTypes.string,
};
