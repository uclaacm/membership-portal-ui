'use client';

import React from 'react';
import PropTypes from 'prop-types';
// `.modal-wrapper` lives here — imported by the component so mounting it on a page that hasn't
// pulled the sheet in can't leave it unstyled at the foot of the document.
import './style.scss';
import ModalShell from './ModalShell';

export default class SyncSheetsModal extends React.Component {
  constructor() {
    super();
    this.state = {
      sheetUrl: '',
      syncStatus: 'idle',
      syncMessage: '',
    };
  }

  handleUrlChange = e => {
    this.setState({ sheetUrl: e.target.value, syncStatus: 'idle', syncMessage: '' });
  };

  handleSync = async () => {
    this.setState({ syncStatus: 'syncing', syncMessage: '' });
    const result = await this.props.onSync(this.state.sheetUrl);
    this.setState({
      syncStatus: result.success ? 'success' : 'error',
      syncMessage: result.success ? (result.message || 'Sync complete.') : (result.error || 'Sync failed.'),
    });
  };

  handleClose = () => {
    this.setState({ sheetUrl: '', syncStatus: 'idle', syncMessage: '' });
    this.props.onClose();
  };

  render() {
    const { opened, serviceAccountEmail } = this.props;
    const { sheetUrl, syncStatus, syncMessage } = this.state;

    if (!opened) return null;

    return (
      <ModalShell
        title="Sync events from Sheets"
        subtitle="Import events from your committee’s spreadsheet."
        onClose={this.handleClose}
        wide
        footer={(
          <>
            <button type="button" className="modal-action" onClick={this.handleClose}>Close</button>
            <button type="button" className="modal-action modal-action--primary" onClick={this.handleSync} disabled={syncStatus === 'syncing' || !sheetUrl.trim()}>
              {syncStatus === 'syncing' ? 'Syncing…' : 'Sync events'}
            </button>
          </>
        )}
      >

            <p>
              Paste the URL or ID of a Google Sheets spreadsheet below. The sheet must meet the following requirements:
            </p>
            <ul>
              <li>
                Shared with <strong>{serviceAccountEmail || 'the portal service account'}</strong> (Viewer access or higher)
              </li>
              <li>Tabs named <strong>Week 1</strong> through <strong>Week 10</strong></li>
              <li>
                Columns in order: Committee, Title, Start Date, End Date, Day of the Week, Start Time, End Time, Location, Description, Event Link, Banner
              </li>
            </ul>

            <div className="form-elem">
              <label className="modal-field" htmlFor="sync-sheet-url">Spreadsheet URL or ID</label>
              <input
                id="sync-sheet-url"
                type="text"
                className="modal-input"
                placeholder="Paste spreadsheet URL or ID"
                value={sheetUrl}
                onChange={this.handleUrlChange}
              />
            </div>

        {syncMessage && <p className={`modal-feedback ${syncStatus === 'success' ? 'is-ok' : 'is-error'}`} role="status">{syncMessage}</p>}
      </ModalShell>
    );
  }
}

SyncSheetsModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSync: PropTypes.func.isRequired,
  serviceAccountEmail: PropTypes.string,
};
