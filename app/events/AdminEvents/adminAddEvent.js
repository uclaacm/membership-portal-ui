'use client';

import React, { createRef } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

import DatePicker from 'react-datepicker';
import Button from '@/components/Button';
import Config from '@/lib/config';
import uploadImage from '@/app/actions/image/uploadImage';

import 'react-datepicker/dist/react-datepicker.css';

export default class AdminAddEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: this.props.event,
      startTimeStr: this.props.event?.startDate ? this.props.event.startDate.format('HH:mm') : '',
      endTimeStr: this.props.event?.endDate ? this.props.event.endDate.format('HH:mm') : '',
      coverImageFile: null,
      coverMode: 'url',
      isPreviewFlipped: false,
      isRepeating: false,
      recurrenceFrequency: 'weekly',
      seriesEndDate: null,
      seriesEndTimeStr: '',
      editScope: 'instance',
      seriesInstanceCount: null,
      showDeleteConfirm: false,
      deleteScope: 'single',
    };
    this.coverUploadRef = createRef();
    this._loadedGroupKey = null;
    this.resizeTextArea = this.resizeTextArea.bind(this);
    this.handleChangeCover = this.handleChangeCover.bind(this);
    this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
    this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
    this.handleChangeTime = this.handleChangeTime.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePreviewFlip = this.handlePreviewFlip.bind(this);
    this.handleChangeSeriesEndDate = this.handleChangeSeriesEndDate.bind(this);
    this.handleChangeSeriesTime = this.handleChangeSeriesTime.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { showing, isEdit, event, onLoadRepeatedGroup } = this.props;
    if (showing && isEdit && event?.eventGroupId && onLoadRepeatedGroup) {
      const key = `${event.uuid}-${event.eventGroupId}`;
      if (this._loadedGroupKey !== key) {
        this._loadedGroupKey = key;
        Promise.resolve(onLoadRepeatedGroup(event.eventGroupId)).then((r) => {
          if (r?.success) this.setState({ seriesInstanceCount: r.events?.length ?? 0 });
          else this.setState({ seriesInstanceCount: null });
        });
      }
    }
    if (!showing && prevProps.showing) {
      this._loadedGroupKey = null;
    }
  }

  resizeTextArea(e) {
    e.target.style.height = '5px';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  handleChangeStartDate(date) {
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.event.startDate = date ? moment(date) : null;
      return newState;
    });
  }

  handleChangeEndDate(date) {
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.event.endDate = date ? moment(date) : null;
      return newState;
    });
  }

  handleChangeSeriesEndDate(date) {
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.seriesEndDate = date ? moment(date) : null;
      return newState;
    });
  }

  handleChangeSeriesTime(e) {
    const raw = e.target.value;
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.seriesEndTimeStr = raw;
      if (raw) {
        const [hh, mm] = raw.split(':').map(n => parseInt(n, 10));
        if (newState.seriesEndDate) {
          newState.seriesEndDate = newState.seriesEndDate.clone().set({ hour: hh, minute: mm });
        } else {
          newState.seriesEndDate = moment({ hour: hh, minute: mm });
        }
      }
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

  setRepeating(isRepeating) {
    this.setState((prev) => {
      const next = Object.assign({}, prev, { isRepeating });
      if (isRepeating && prev.event?.startDate) {
        next.seriesEndDate = prev.event.startDate.clone().add(1, 'month');
        const t = prev.event.endDate
          ? prev.event.endDate.format('HH:mm')
          : (prev.endTimeStr || '12:00');
        next.seriesEndTimeStr = t;
        if (next.seriesEndDate) {
          const [hh, mm] = t.split(':').map(n => parseInt(n, 10));
          next.seriesEndDate = next.seriesEndDate.clone().set({ hour: hh, minute: mm });
        }
      }
      return next;
    });
  }

  finalizeSubmit(callback) {
    if (this.state.coverImageFile) {
      const formData = new FormData();
      formData.append('image', this.state.coverImageFile);

      uploadImage(formData).then((result) => {
        if (result.success && result.uuid) {
          this.setState((prev) => {
            const newState = Object.assign({}, prev);
            newState.event.cover = `${Config.API_URL + Config.routes.image.specific}/${result.uuid}`;
            return newState;
          }, callback);
        } else {
          callback();
        }
      });
    } else {
      callback();
    }
  }

  handleSubmit() {
    const {
      event,
      isRepeating,
      recurrenceFrequency,
      seriesEndDate,
      seriesEndTimeStr,
      editScope,
    } = this.state;
    const { isEdit } = this.props;

    if (!event.title || !event.startDate || !event.endDate) return;

    if (!isEdit && isRepeating) {
      if (!seriesEndDate || !seriesEndTimeStr) {
        alert('Please set the series end date and time.');
        return;
      }
      let seriesEnd = seriesEndDate.clone();
      const [hh, mm] = seriesEndTimeStr.split(':').map(n => parseInt(n, 10));
      seriesEnd = seriesEnd.set({ hour: hh, minute: mm });
      if (seriesEnd.isBefore(event.startDate)) {
        alert('Series end must be on or after the first event start time.');
        return;
      }
      this.finalizeSubmit(() => {
        const ev = Object.assign({}, this.state.event);
        delete ev.uuid;
        delete ev.eventGroupId;
        delete ev.attendanceCode;
        this.props.onCreateRepeated(ev, {
          frequency: recurrenceFrequency,
          seriesEndDate: seriesEnd.toISOString(),
        });
      });
      return;
    }

    if (isEdit && event.eventGroupId && editScope !== 'instance') {
      this.finalizeSubmit(() => {
        const ev = Object.assign({}, this.state.event);
        delete ev.uuid;
        delete ev.eventGroupId;
        this.props.onUpdateRepeatedGroup(
          event.eventGroupId,
          editScope,
          editScope === 'fromInstance' ? event.uuid : undefined,
          ev,
        );
      });
      return;
    }

    this.finalizeSubmit(() => {
      if (this.props.onClickAdd) this.props.onClickAdd(this.state.event);
    });
  }

  confirmDelete() {
    const { event, deleteScope } = this.state;
    const { onDeleteEvent } = this.props;
    if (!onDeleteEvent || !event?.uuid) return;

    if (!event.eventGroupId) {
      onDeleteEvent({ kind: 'single', uuid: event.uuid });
    } else if (deleteScope === 'single') {
      onDeleteEvent({ kind: 'single', uuid: event.uuid });
    } else {
      onDeleteEvent({
        kind: 'group',
        eventGroupId: event.eventGroupId,
        scope: deleteScope === 'all' ? 'all' : 'fromInstance',
        fromUuid: deleteScope === 'fromInstance' ? event.uuid : undefined,
      });
    }
    this.setState({ showDeleteConfirm: false });
  }

  handleChangeTime(e) {
    const isStart = e.target.name === 'startTime';
    const strKey = isStart ? 'startTimeStr' : 'endTimeStr';
    const dateKey = isStart ? 'startDate' : 'endDate';
    const raw = e.target.value;

    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState[strKey] = raw;
      if (raw) {
        const [hh, mm] = raw.split(':').map(n => parseInt(n, 10));
        if (newState.event[dateKey]) {
          newState.event[dateKey] = newState.event[dateKey].clone().set({ hour: hh, minute: mm });
        } else {
          newState.event[dateKey] = moment({ hour: hh, minute: mm });
        }
      }
      return newState;
    });
  }

  handlePreviewFlip() {
    this.setState(prev => ({ isPreviewFlipped: !prev.isPreviewFlipped }));
  }

  handleChangeCover(e) {
    e.persist();
    const file = e.target.files?.[0];

    if (!file) {
      this.setState((prev) => {
        const newState = Object.assign({}, prev);
        newState.event.cover = e.target.value;
        newState.coverImageFile = null;
        return newState;
      });
    } else {
      if (file.size > 3 * 1024 * 1024) {
        alert('File size exceeds 3 MB');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        this.setState((prev) => {
          const newState = Object.assign({}, prev);
          newState.event.cover = reader.result;
          newState.coverImageFile = file;
          return newState;
        });
      };
      reader.readAsDataURL(file);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.event = nextProps.event;
      if (newState.event) newState.event.attendanceCode = nextProps.event.attendanceCode || '';
      newState.startTimeStr = nextProps.event?.startDate ? nextProps.event.startDate.format('HH:mm') : '';
      newState.endTimeStr = nextProps.event?.endDate ? nextProps.event.endDate.format('HH:mm') : '';
      if (!nextProps.isEdit) {
        newState.isRepeating = false;
        newState.editScope = 'instance';
        newState.seriesInstanceCount = null;
        newState.seriesEndDate = null;
        newState.seriesEndTimeStr = '';
        newState.showDeleteConfirm = false;
        newState.deleteScope = 'single';
      } else {
        newState.editScope = 'instance';
        newState.showDeleteConfirm = false;
        newState.deleteScope = 'single';
      }
      if (!nextProps.showing) {
        newState.showDeleteConfirm = false;
      }
      return newState;
    });
  }

  renderPreviewCard() {
    const { event, isPreviewFlipped, isRepeating, seriesEndDate } = this.state;
    const committeeColorMap = Object.fromEntries(Config.committeeColors);

    const title = event.title || 'Event Title';
    const committee = event.committee || 'ACM';
    const location = event.location || 'Location TBD';
    const points = event.attendancePoints || '0';

    let dateStr = 'Date TBD';
    if (event.startDate && event.endDate) {
      dateStr = `${event.startDate.format('MMM D, YYYY')}, ${event.startDate.format('h:mm a')} – ${event.endDate.format('h:mm a')}`;
    } else if (event.startDate) {
      dateStr = event.startDate.format('MMM D, YYYY, h:mm a');
    }

    const committeeColor = committeeColorMap[committee] || '#1E6CFF';
    const repeatHint = !this.props.isEdit && isRepeating && seriesEndDate
      ? `Repeats through ${seriesEndDate.format('MMM D, YYYY')}`
      : null;

    return (
      <div className={`preview-card-container${isPreviewFlipped ? ' is-flipped' : ''}`}>
        <div className="preview-card-flipper">
          <div className="preview-card preview-card-front" onClick={this.handlePreviewFlip} style={{ cursor: 'pointer' }} title="Click to see description">
            <div className="preview-image-container">
              <div
                className="preview-cover"
                style={{ backgroundImage: `url(${event.cover || '/logo.png'})` }}
              />
              <div className="preview-points-pill">{points} PTS</div>
            </div>
            <div className="preview-text-container">
              <p className="preview-title">{title}</p>
              <p className="preview-meta">🗓️ {dateStr}</p>
              {repeatHint && <p className="preview-meta preview-repeat-hint">{repeatHint}</p>}
              <p className="preview-meta">📍 {location}</p>
              <p className="preview-meta" style={{ color: committeeColor }}>{committee}</p>
              <div className="preview-rsvp-pill">RSVP</div>
            </div>
          </div>

          <div className="preview-card preview-card-back">
            <div className="preview-back-content">
              <button type="button" className="preview-flip-back-btn" onClick={this.handlePreviewFlip}>
                ← Back
              </button>
              <h3>{title}</h3>
              <div className="preview-description-scroll">
                <p>{event.description || 'Event description will appear here...'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const committeeColorMap = Object.fromEntries(Config.committeeColors);
    const {
      coverMode,
      isRepeating,
      recurrenceFrequency,
      seriesEndDate,
      seriesEndTimeStr,
      editScope,
      seriesInstanceCount,
      showDeleteConfirm,
      deleteScope,
      event,
    } = this.state;
    const { isEdit, showing } = this.props;
    const isRepeatedGroup = !!(isEdit && event?.eventGroupId);
    const showAttendanceCode = !(!isEdit && isRepeating)
      && (!isRepeatedGroup || editScope === 'instance');

    return (
      <div className={`add-event-overlay${showing ? ' showing' : ''}`} onClick={this.props.onClickCancel}>
        <div className="event-modal" onClick={e => e.stopPropagation()}>

          <div className="modal-header">
            <h2 className="modal-title">{isEdit ? 'Edit Event' : 'Create Event'}</h2>
            <button type="button" className="modal-close-btn" onClick={this.props.onClickCancel} aria-label="Close">✕</button>
          </div>

          <div className="modal-content">

            <div className="modal-form">

              {!isEdit && (
                <div className="form-section">
                  <p className="section-label">Event type</p>
                  <div className="cover-mode-toggle">
                    <button
                      type="button"
                      className={`mode-btn${!isRepeating ? ' active' : ''}`}
                      onClick={() => this.setRepeating(false)}
                    >
                      One-time
                    </button>
                    <button
                      type="button"
                      className={`mode-btn${isRepeating ? ' active' : ''}`}
                      onClick={() => this.setRepeating(true)}
                    >
                      Repeating series
                    </button>
                  </div>
                </div>
              )}

              {isRepeatedGroup && (
                <div className="form-section repeat-scope-section">
                  <p className="section-label">Apply changes to</p>
                  {seriesInstanceCount != null && (
                    <p className="series-count-hint">
                      This series has
                      {' '}
                      {seriesInstanceCount}
                      {' '}
                      scheduled occurrence
                      {seriesInstanceCount === 1 ? '' : 's'}
                      .
                    </p>
                  )}
                  <div className="repeat-scope-options">
                    <label className="radio-row">
                      <input
                        type="radio"
                        name="editScope"
                        checked={editScope === 'instance'}
                        onChange={() => this.setState({ editScope: 'instance' })}
                      />
                      <span>This instance only</span>
                    </label>
                    <label className="radio-row">
                      <input
                        type="radio"
                        name="editScope"
                        checked={editScope === 'all'}
                        onChange={() => this.setState({ editScope: 'all' })}
                      />
                      <span>All events in this series</span>
                    </label>
                    <label className="radio-row">
                      <input
                        type="radio"
                        name="editScope"
                        checked={editScope === 'fromInstance'}
                        onChange={() => this.setState({ editScope: 'fromInstance' })}
                      />
                      <span>This instance and future</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="form-section">
                <p className="section-label">Cover Image <span className="optional-mark">optional</span></p>
                <div className="cover-mode-toggle">
                  <button
                    type="button"
                    className={`mode-btn${coverMode === 'url' ? ' active' : ''}`}
                    onClick={() => this.setState({ coverMode: 'url' })}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    className={`mode-btn${coverMode === 'upload' ? ' active' : ''}`}
                    onClick={() => this.setState({ coverMode: 'upload' })}
                  >
                    Upload
                  </button>
                </div>
                {coverMode === 'url' ? (
                  <input
                    type="text"
                    value={this.state.event.cover && !this.state.coverImageFile ? this.state.event.cover : ''}
                    name="cover"
                    placeholder="https://..."
                    onChange={this.handleChangeCover}
                  />
                ) : (
                  <div className="upload-zone" onClick={() => this.coverUploadRef.current?.click()}>
                    <input
                      type="file"
                      value={''}
                      name="cover"
                      ref={this.coverUploadRef}
                      id="coverInput"
                      accept="image/*"
                      onChange={this.handleChangeCover}
                      onClick={(e) => { e.target.value = null; }}
                    />
                    {this.state.coverImageFile ? (
                      <span className="upload-zone-label chosen">✓ {this.state.coverImageFile.name}</span>
                    ) : (
                      <span className="upload-zone-label">Click to choose an image</span>
                    )}
                  </div>
                )}
              </div>

              <div className="form-section">
                <p className="section-label">Basic Info</p>
                <div className="field-group">
                  <label>Title <span className="required-mark">*</span></label>
                  <input type="text" value={this.state.event.title} name="title" onChange={this.handleChange} placeholder="My Awesome Event" />
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label>Committee <span className="required-mark">*</span></label>
                    <select
                      value={this.state.event.committee}
                      name="committee"
                      onChange={this.handleChange}
                      style={{ color: committeeColorMap[this.state.event.committee] }}
                    >
                      <option value="ACM" style={{ color: committeeColorMap['ACM'] }}>ACM</option>
                      {Config.committees.map((committee, index) => (
                        <option key={index} value={committee} style={{ color: committeeColorMap[committee] }}>{committee}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label>External RSVP Link <span className="optional-mark">optional — overrides built-in RSVP</span></label>
                    <input type="text" value={this.state.event.eventLink ?? ''} name="eventLink" onChange={this.handleChange} placeholder="https://forms.google.com/..." />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <p className="section-label">Schedule</p>
                <div className="field-row">
                  <div className="field-group field-grow-3">
                    <label>Start Date <span className="required-mark">*</span></label>
                    <DatePicker
                      selected={this.state.event.startDate ? this.state.event.startDate.toDate() : null}
                      onChange={this.handleChangeStartDate}
                      className="date-picker"
                    />
                  </div>
                  <div className="field-group field-grow-2">
                    <label>Start Time <span className="required-mark">*</span></label>
                    <input
                      type="time"
                      onChange={this.handleChangeTime}
                      name="startTime"
                      value={this.state.startTimeStr}
                    />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-group field-grow-3">
                    <label>End Date <span className="required-mark">*</span></label>
                    <DatePicker
                      selected={this.state.event.endDate ? this.state.event.endDate.toDate() : null}
                      onChange={this.handleChangeEndDate}
                      className="date-picker"
                    />
                  </div>
                  <div className="field-group field-grow-2">
                    <label>End Time <span className="required-mark">*</span></label>
                    <input
                      type="time"
                      onChange={this.handleChangeTime}
                      name="endTime"
                      value={this.state.endTimeStr}
                    />
                  </div>
                </div>
                {!isEdit && isRepeating && (
                  <>
                    <div className="field-row">
                      <div className="field-group field-grow-3">
                        <label>Repeat <span className="required-mark">*</span></label>
                        <select
                          value={recurrenceFrequency}
                          name="recurrenceFrequency"
                          onChange={e => this.setState({ recurrenceFrequency: e.target.value })}
                          className="recurrence-frequency-select"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field-group field-grow-3">
                        <label>Series ends (date) <span className="required-mark">*</span></label>
                        <DatePicker
                          selected={seriesEndDate ? seriesEndDate.toDate() : null}
                          onChange={this.handleChangeSeriesEndDate}
                          className="date-picker"
                        />
                      </div>
                      <div className="field-group field-grow-2">
                        <label>Series ends (time) <span className="required-mark">*</span></label>
                        <input
                          type="time"
                          onChange={this.handleChangeSeriesTime}
                          name="seriesEndTime"
                          value={seriesEndTimeStr}
                        />
                      </div>
                    </div>
                    <p className="field-hint">The first occurrence uses the schedule above. Series end must be on or after the start of the first event.</p>
                  </>
                )}
                <div className="field-group">
                  <label>Location <span className="required-mark">*</span></label>
                  <input type="text" value={this.state.event.location} name="location" onChange={this.handleChange} placeholder="EBU3B B250" />
                </div>
              </div>

              <div className="form-section">
                <p className="section-label">Attendance</p>
                {!isEdit && isRepeating && (
                  <p className="field-hint">Check-in codes are generated for each occurrence automatically.</p>
                )}
                {isRepeatedGroup && !showAttendanceCode && (
                  <p className="field-hint">Check-in codes are per occurrence. Switch to &quot;This instance only&quot; to edit the code for this date.</p>
                )}
                <div className="field-row">
                  <div className="field-group">
                    <label>
                      Check-in Code
                      {' '}
                      {showAttendanceCode ? <span className="required-mark">*</span> : <span className="optional-mark">— set per instance</span>}
                    </label>
                    <input
                      type="text"
                      value={this.state.event.attendanceCode}
                      name="attendanceCode"
                      onChange={this.handleChange}
                      placeholder="e.g. HACK2025"
                      disabled={!showAttendanceCode}
                    />
                  </div>
                  <div className="field-group">
                    <label>Points <span className="required-mark">*</span></label>
                    <input
                      type="text"
                      value={this.state.event.attendancePoints}
                      name="attendancePoints"
                      onChange={this.handleChange}
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <p className="section-label">Description <span className="optional-mark">optional</span></p>
                <div className="field-group">
                  <textarea
                    value={this.state.event.description}
                    name="description"
                    onChange={this.handleChange}
                    onKeyUp={this.resizeTextArea}
                    placeholder="Tell people what this event is about..."
                  />
                </div>
              </div>

            </div>

            <div className="modal-preview">
              <p className="preview-label">Preview</p>
              {this.renderPreviewCard()}
              <p className="preview-hint">Updates as you type</p>
            </div>

          </div>

          {showDeleteConfirm && isEdit && (
            <div className="delete-confirm-panel">
              <p className="delete-confirm-title">Delete event?</p>
              {event.eventGroupId ? (
                <div className="repeat-scope-options delete-scope-options">
                  <label className="radio-row">
                    <input
                      type="radio"
                      name="deleteScope"
                      checked={deleteScope === 'single'}
                      onChange={() => this.setState({ deleteScope: 'single' })}
                    />
                    <span>This instance only</span>
                  </label>
                  <label className="radio-row">
                    <input
                      type="radio"
                      name="deleteScope"
                      checked={deleteScope === 'all'}
                      onChange={() => this.setState({ deleteScope: 'all' })}
                    />
                    <span>Entire series</span>
                  </label>
                  <label className="radio-row">
                    <input
                      type="radio"
                      name="deleteScope"
                      checked={deleteScope === 'fromInstance'}
                      onChange={() => this.setState({ deleteScope: 'fromInstance' })}
                    />
                    <span>This instance and future</span>
                  </label>
                </div>
              ) : (
                <p className="delete-confirm-body">This cannot be undone.</p>
              )}
              <div className="delete-confirm-actions">
                <Button
                  onClick={() => this.setState({ showDeleteConfirm: false })}
                  style="red"
                  text="Cancel"
                  icon=""
                />
                <Button onClick={this.confirmDelete} style="green" text="Confirm delete" icon="" />
              </div>
            </div>
          )}

          <div className="modal-footer">
            <div className="modal-footer-left">
              {isEdit && this.props.onDeleteEvent && (
                <Button
                  onClick={() => this.setState({ showDeleteConfirm: true })}
                  style="red"
                  text="Delete"
                  icon=""
                />
              )}
            </div>
            <div className="modal-footer-right">
              <Button onClick={this.props.onClickCancel} style="red" text="Cancel" icon="" />
              <Button
                onClick={this.handleSubmit}
                style="green"
                text={isEdit ? 'Update Event' : 'Create Event'}
                icon=""
              />
            </div>
          </div>

        </div>
      </div>
    );
  }
}

AdminAddEvent.propTypes = {
  event: PropTypes.object,
  onClickAdd: PropTypes.func,
  onClickCancel: PropTypes.func,
  onCreateRepeated: PropTypes.func,
  onUpdateRepeatedGroup: PropTypes.func,
  onDeleteEvent: PropTypes.func,
  onLoadRepeatedGroup: PropTypes.func,
  isEdit: PropTypes.bool,
  showing: PropTypes.bool,
};

AdminAddEvent.defaultProps = {
  onClickAdd: null,
  onClickCancel: null,
  onCreateRepeated: null,
  onUpdateRepeatedGroup: null,
  onDeleteEvent: null,
  onLoadRepeatedGroup: null,
  isEdit: false,
  showing: false,
};
