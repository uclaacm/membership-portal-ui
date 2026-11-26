'use client';

import React from 'react';
import PropTypes from 'prop-types';
import ModalShell from './ModalShell';

export default class ConfirmationModal extends React.Component {
  render() {
    const {
      title, message, submit, cancel, opened,
    } = this.props;
    return opened ? (
      <ModalShell
        title={title}
        onClose={cancel}
        footer={(
          <>
            <button type="button" className="modal-action" onClick={cancel}>Cancel</button>
            <button type="button" className="modal-action modal-action--primary" onClick={submit}>Confirm</button>
          </>
        )}
      >
        <p style={{ margin: 0 }}>{message}</p>
      </ModalShell>
    ) : null;
  }
}

ConfirmationModal.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  submit: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  opened: PropTypes.bool.isRequired,
};
