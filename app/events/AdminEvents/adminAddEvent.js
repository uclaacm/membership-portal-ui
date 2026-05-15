'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

import DatePicker from 'react-datepicker';
import Button from '@/components/Button';
import Config from '@/lib/config';
import uploadImage from '@/app/actions/image/uploadImage';

import 'react-datepicker/dist/react-datepicker.css';

/** ISO weekdays for recurrence API (`1`=Mon … `7`=Sun). */
const RECURRENCE_ISO_WEEKDAYS = [
  { iso: 1, label: 'Mon' },
  { iso: 2, label: 'Tue' },
  { iso: 3, label: 'Wed' },
  { iso: 4, label: 'Thu' },
  { iso: 5, label: 'Fri' },
  { iso: 6, label: 'Sat' },
  { iso: 7, label: 'Sun' },
];

function AdminAddEvent({
  event: eventProp,
  onClickAdd = null,
  onClickCancel = null,
  onCreateRepeated = null,
  onUpdateRepeatedGroup = null,
  onDeleteEvent = null,
  onLoadRepeatedGroup = null,
  isEdit = false,
  showing = false,
}) {
  const [event, setEvent] = useState(eventProp);
  const [startTimeStr, setStartTimeStr] = useState(() =>
    (eventProp?.startDate ? eventProp.startDate.format('HH:mm') : ''),
  );
  const [endTimeStr, setEndTimeStr] = useState(() =>
    (eventProp?.endDate ? eventProp.endDate.format('HH:mm') : ''),
  );

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverMode, setCoverMode] = useState('url');

  const [isPreviewFlipped, setIsPreviewFlipped] = useState(false);
  const [isPlatformsOpen, setIsPlatformsOpen] = useState(false);

  const [isRepeating, setIsRepeating] = useState(false);
  const [recurrenceIntervalWeeks, setRecurrenceIntervalWeeks] = useState(1);
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState([]);
  const [seriesEndDate, setSeriesEndDate] = useState(null);

  const [editScope, setEditScope] = useState('instance');
  const [seriesInstanceCount, setSeriesInstanceCount] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteScope, setDeleteScope] = useState('single');

  const coverUploadRef = useRef(null);
  const loadedGroupKeyRef = useRef(null);
  const multiSelectRef = useRef(null);

  useEffect(() => {
    const syncFromProps = () => {
      if (eventProp) {
        setEvent({ ...eventProp, attendanceCode: eventProp.attendanceCode || '' });
      } else {
        setEvent(eventProp);
      }
      setStartTimeStr(eventProp?.startDate ? eventProp.startDate.format('HH:mm') : '');
      setEndTimeStr(eventProp?.endDate ? eventProp.endDate.format('HH:mm') : '');
      if (!isEdit) {
        setIsRepeating(false);
        setEditScope('instance');
        setSeriesInstanceCount(null);
        setSeriesEndDate(null);
        setRecurrenceIntervalWeeks(1);
        setRecurrenceDaysOfWeek([]);
        setShowDeleteConfirm(false);
        setDeleteScope('single');
      } else {
        setEditScope('instance');
        setShowDeleteConfirm(false);
        setDeleteScope('single');
      }
      if (!showing) {
        setShowDeleteConfirm(false);
      }
    };
    queueMicrotask(syncFromProps);
  }, [eventProp, isEdit, showing]);

  useEffect(() => {
    if (!showing) {
      loadedGroupKeyRef.current = null;
    }
  }, [showing]);

  useEffect(() => {
    if (showing && isEdit && eventProp?.eventGroupId && onLoadRepeatedGroup) {
      const key = `${eventProp.uuid}-${eventProp.eventGroupId}`;
      if (loadedGroupKeyRef.current !== key) {
        loadedGroupKeyRef.current = key;
        Promise.resolve(onLoadRepeatedGroup(eventProp.eventGroupId)).then((r) => {
          if (r?.success) setSeriesInstanceCount(r.events?.length ?? 0);
          else setSeriesInstanceCount(null);
        });
      }
    }
  }, [showing, isEdit, eventProp, onLoadRepeatedGroup]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsidePlatforms);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsidePlatforms);
    };
  }, [isPlatformsOpen]);

  const handleClickOutsidePlatforms = (e) => {
    if (isPlatformsOpen && !multiSelectRef.current?.contains(e.target)) {
      setIsPlatformsOpen(false);
    }
  };

  const resizeTextArea = useCallback((e) => {
    e.target.style.height = '5px';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }, []);

  const handleTogglePlatform = useCallback((option) => {
    setEvent(prev => {
      const platforms = prev.platforms ?? [];
      const newPlatforms = platforms.includes(option) ? platforms.filter(p => p !== option) : [...platforms, option];

      return {
        ...prev,
        platforms: newPlatforms,
      };
    });
  });

  const handleChangeStartDate = useCallback((date) => {
    setEvent((prev) => ({
      ...prev,
      startDate: date ? moment(date) : null,
    }));
  }, []);

  const handleChangeEndDate = useCallback((date) => {
    setEvent((prev) => ({
      ...prev,
      endDate: date ? moment(date) : null,
    }));
  }, []);

  const handleChangeSeriesEndDate = useCallback((date) => {
    setSeriesEndDate(date ? moment(date).startOf('day') : null);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({ ...prev, [name]: value }));
  }, []);

  const applyRepeatingDefaults = useCallback(() => {
    if (!event?.startDate) return;
    setSeriesEndDate(event.startDate.clone().add(1, 'month').startOf('day'));
  }, [event]);

  const toggleRecurrenceWeekday = useCallback((iso) => {
    setRecurrenceDaysOfWeek((prev) => (
      prev.includes(iso)
        ? prev.filter((d) => d !== iso).sort((a, b) => a - b)
        : [...prev, iso].sort((a, b) => a - b)
    ));
  }, []);

  const setRepeatingMode = useCallback((next) => {
    setIsRepeating(next);
    if (next) {
      applyRepeatingDefaults();
    }
  }, [applyRepeatingDefaults]);

  const finalizeSubmit = useCallback((onReady) => {
    if (coverImageFile) {
      const formData = new FormData();
      formData.append('image', coverImageFile);

      uploadImage(formData).then((result) => {
        if (result.success && result.uuid) {
          const merged = {
            ...event,
            cover: `${Config.API_URL + Config.routes.image.specific}/${result.uuid}`,
          };
          setEvent(merged);
          onReady(merged);
        } else {
          onReady(event);
        }
      });
    } else {
      onReady(event);
    }
  }, [coverImageFile, event]);

  const handleSubmit = useCallback(() => {
    if (!event.title || !event.startDate || !event.endDate) return;

    if (!isEdit && isRepeating) {
      if (!seriesEndDate) {
        alert('Please set when the series ends (date).');
        return;
      }
      const startCalendarDay = event.startDate.clone().startOf('day');
      const seriesLastCalendarDay = seriesEndDate.clone().startOf('day');
      if (seriesLastCalendarDay.isBefore(startCalendarDay)) {
        alert('Series end date must be on or after the first event start date.');
        return;
      }
      const parsedIw = Number.parseInt(String(recurrenceIntervalWeeks), 10);
      const intervalWeeks = Number.isFinite(parsedIw) && parsedIw >= 1 ? parsedIw : 1;
      const recurrence = {
        intervalWeeks,
        seriesEndDate: seriesLastCalendarDay.toISOString(),
      };
      if (recurrenceDaysOfWeek.length > 0) {
        recurrence.daysOfWeek = [...recurrenceDaysOfWeek];
      }
      finalizeSubmit((ev) => {
        const payload = Object.assign({}, ev);
        delete payload.uuid;
        delete payload.eventGroupId;
        onCreateRepeated(payload, recurrence);
      });
      return;
    }

    if (isEdit && event.eventGroupId && editScope !== 'instance') {
      finalizeSubmit((ev) => {
        const payload = Object.assign({}, ev);
        delete payload.uuid;
        delete payload.eventGroupId;
        delete payload.attendanceCode;
        delete payload.startDate;
        delete payload.endDate;
        onUpdateRepeatedGroup(
          event.eventGroupId,
          editScope,
          editScope === 'fromInstance' ? event.uuid : undefined,
          payload,
        );
      });
      return;
    }

    finalizeSubmit((ev) => {
      if (onClickAdd) onClickAdd(ev);
    });
  }, [
    event,
    isEdit,
    isRepeating,
    seriesEndDate,
    recurrenceIntervalWeeks,
    recurrenceDaysOfWeek,
    editScope,
    finalizeSubmit,
    onClickAdd,
    onCreateRepeated,
    onUpdateRepeatedGroup,
  ]);

  const confirmDelete = useCallback(() => {
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
    setShowDeleteConfirm(false);
  }, [event, deleteScope, onDeleteEvent]);

  const handleChangeTime = useCallback((e) => {
    const isStart = e.target.name === 'startTime';
    const strKey = isStart ? 'start' : 'end';
    const dateKey = isStart ? 'startDate' : 'endDate';
    const raw = e.target.value;

    if (strKey === 'start') setStartTimeStr(raw);
    else setEndTimeStr(raw);

    if (raw) {
      const [hh, mm] = raw.split(':').map(n => parseInt(n, 10));
      setEvent((prev) => {
        if (prev[dateKey]) {
          return { ...prev, [dateKey]: prev[dateKey].clone().set({ hour: hh, minute: mm }) };
        }
        return { ...prev, [dateKey]: moment({ hour: hh, minute: mm }) };
      });
    }
  }, []);

  const handlePreviewFlip = useCallback(() => {
    setIsPreviewFlipped(prev => !prev);
  }, []);

  const handleChangeCover = useCallback((e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setEvent((prev) => ({ ...prev, cover: e.target.value }));
      setCoverImageFile(null);
    } else {
      if (file.size > 3 * 1024 * 1024) {
        alert('File size exceeds 3 MB');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvent((prev) => ({ ...prev, cover: reader.result }));
        setCoverImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const renderPreviewCard = () => {
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
    const repeatHint = !isEdit && isRepeating && seriesEndDate
      ? `Repeats through ${seriesEndDate.format('MMM D, YYYY')}`
      : null;

    return (
      <div className={`preview-card-container${isPreviewFlipped ? ' is-flipped' : ''}`}>
        <div className="preview-card-flipper">
          <div className="preview-card preview-card-front" onClick={handlePreviewFlip} style={{ cursor: 'pointer' }} title="Click to see description">
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
              <button type="button" className="preview-flip-back-btn" onClick={handlePreviewFlip}>
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
  };

  const committeeColorMap = Object.fromEntries(Config.committeeColors);
  const isRepeatedGroup = !!(isEdit && event?.eventGroupId);
  const showAttendanceCode = !isRepeatedGroup || editScope === 'instance';
  /** Repeating create: codes are derived from optional user base + server suffix. */
  const isRepeatingSeriesCreate = !isEdit && isRepeating;
  const scheduleLockedForGroupEdit = isRepeatedGroup && editScope !== 'instance';

  return (
    <div className={`add-event-overlay${showing ? " showing" : ""}`} onClick={onClickCancel}>
      <div className="event-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "Edit Event" : "Create Event"}</h2>
          <button type="button" className="modal-close-btn" onClick={onClickCancel} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-content">
          <div className="modal-form">
            {!isEdit && (
              <div className="form-section">
                <p className="section-label">Event type</p>
                <div className="cover-mode-toggle">
                  <button
                    type="button"
                    className={`mode-btn${!isRepeating ? " active" : ""}`}
                    onClick={() => setRepeatingMode(false)}>
                    One-time
                  </button>
                  <button
                    type="button"
                    className={`mode-btn${isRepeating ? " active" : ""}`}
                    onClick={() => setRepeatingMode(true)}>
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
                    This series has {seriesInstanceCount} scheduled occurrence
                    {seriesInstanceCount === 1 ? "" : "s"}.
                  </p>
                )}
                <div className="repeat-scope-options">
                  <label className="radio-row">
                    <input
                      type="radio"
                      name="editScope"
                      checked={editScope === "instance"}
                      onChange={() => setEditScope("instance")}
                    />
                    <span>This instance only</span>
                  </label>
                  <label className="radio-row">
                    <input
                      type="radio"
                      name="editScope"
                      checked={editScope === "all"}
                      onChange={() => setEditScope("all")}
                    />
                    <span>All events in this series</span>
                  </label>
                  <label className="radio-row">
                    <input
                      type="radio"
                      name="editScope"
                      checked={editScope === "fromInstance"}
                      onChange={() => setEditScope("fromInstance")}
                    />
                    <span>This instance and future</span>
                  </label>
                </div>
              </div>
            )}

            <div className="form-section">
              <p className="section-label">
                Cover Image <span className="optional-mark">optional</span>
              </p>
              <div className="cover-mode-toggle">
                <button
                  type="button"
                  className={`mode-btn${coverMode === "url" ? " active" : ""}`}
                  onClick={() => setCoverMode("url")}>
                  URL
                </button>
                <button
                  type="button"
                  className={`mode-btn${coverMode === "upload" ? " active" : ""}`}
                  onClick={() => setCoverMode("upload")}>
                  Upload
                </button>
              </div>
              {coverMode === "url" ? (
                <input
                  type="text"
                  value={event.cover && !coverImageFile ? event.cover : ""}
                  name="cover"
                  placeholder="https://..."
                  onChange={handleChangeCover}
                />
              ) : (
                <div className="upload-zone" onClick={() => coverUploadRef.current?.click()}>
                  <input
                    type="file"
                    value={""}
                    name="cover"
                    ref={coverUploadRef}
                    id="coverInput"
                    accept="image/*"
                    onChange={handleChangeCover}
                    onClick={e => {
                      e.target.value = null;
                    }}
                  />
                  {coverImageFile ? (
                    <span className="upload-zone-label chosen">✓ {coverImageFile.name}</span>
                  ) : (
                    <span className="upload-zone-label">Click to choose an image</span>
                  )}
                </div>
              )}
            </div>

            <div className="form-section">
              <p className="section-label">Basic Info</p>
              <div className="field-group">
                <label>
                  Title <span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  value={event.title}
                  name="title"
                  onChange={handleChange}
                  placeholder="My Awesome Event"
                />
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label>
                    Committee <span className="required-mark">*</span>
                  </label>
                  <select
                    value={event.committee}
                    name="committee"
                    onChange={handleChange}
                    style={{ color: committeeColorMap[event.committee] }}>
                    <option value="ACM" style={{ color: committeeColorMap["ACM"] }}>
                      ACM
                    </option>
                    {Config.committees.map((committee, index) => (
                      <option key={index} value={committee} style={{ color: committeeColorMap[committee] }}>
                        {committee}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field-group">
                  <label>
                    External RSVP Link <span className="optional-mark">optional — overrides built-in RSVP</span>
                  </label>
                  <input
                    type="text"
                    value={event.eventLink ?? ""}
                    name="eventLink"
                    onChange={handleChange}
                    placeholder="https://forms.google.com/..."
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <p className="section-label">Schedule</p>
              {scheduleLockedForGroupEdit && (
                <p className="field-hint">
                  This series cannot move start/end dates in bulk — use &quot;This instance only&quot; or edit dates one
                  event at a time.
                </p>
              )}
              <div className="field-row">
                <div className="field-group field-grow-3">
                  <label>
                    Start Date <span className="required-mark">*</span>
                  </label>
                  <DatePicker
                    selected={event.startDate ? event.startDate.toDate() : null}
                    onChange={handleChangeStartDate}
                    className="date-picker"
                    disabled={scheduleLockedForGroupEdit}
                  />
                </div>
                <div className="field-group field-grow-2">
                  <label>
                    Start Time <span className="required-mark">*</span>
                  </label>
                  <input
                    type="time"
                    onChange={handleChangeTime}
                    name="startTime"
                    value={startTimeStr}
                    disabled={scheduleLockedForGroupEdit}
                  />
                </div>
              </div>
              <div className="field-row">
                <div className="field-group field-grow-3">
                  <label>
                    End Date <span className="required-mark">*</span>
                  </label>
                  <DatePicker
                    selected={event.endDate ? event.endDate.toDate() : null}
                    onChange={handleChangeEndDate}
                    className="date-picker"
                    disabled={scheduleLockedForGroupEdit}
                  />
                </div>
                <div className="field-group field-grow-2">
                  <label>
                    End Time <span className="required-mark">*</span>
                  </label>
                  <input
                    type="time"
                    onChange={handleChangeTime}
                    name="endTime"
                    value={endTimeStr}
                    disabled={scheduleLockedForGroupEdit}
                  />
                </div>
              </div>
              {!isEdit && isRepeating && (
                <>
                  <div className="field-row">
                    <div className="field-group field-grow-3">
                      <label>
                        Repeat every <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        className="recurrence-interval-weeks"
                        value={recurrenceIntervalWeeks}
                        onChange={e => {
                          const v = Number.parseInt(e.target.value, 10);
                          setRecurrenceIntervalWeeks(Number.isFinite(v) && v >= 1 ? v : 1);
                        }}
                      />
                      <p className="field-hint">Weeks between pattern repeats (1 = every week).</p>
                    </div>
                  </div>
                  <div className="field-group recurrence-weekdays">
                    <p className="section-label recurrence-weekdays-label">On weekdays</p>
                    <p className="field-hint">Leave all unchecked to repeat only on the first event&apos;s weekday.</p>
                    <div className="recurrence-weekday-chips">
                      {RECURRENCE_ISO_WEEKDAYS.map(({ iso, label }) => (
                        <button
                          key={iso}
                          type="button"
                          className={`recurrence-day-chip${recurrenceDaysOfWeek.includes(iso) ? " is-active" : ""}`}
                          onClick={() => toggleRecurrenceWeekday(iso)}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-group field-grow-3">
                      <label>
                        Series ends (date) <span className="required-mark">*</span>
                      </label>
                      <DatePicker
                        selected={seriesEndDate ? seriesEndDate.toDate() : null}
                        onChange={handleChangeSeriesEndDate}
                        className="date-picker"
                      />
                    </div>
                  </div>
                  <p className="field-hint">
                    Instances are generated through this calendar date. Only the date is used—the first occurrence still
                    uses the start/end schedule above.
                  </p>
                </>
              )}
              <div className="field-group">
                <label>
                  Location <span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  value={event.location}
                  name="location"
                  onChange={handleChange}
                  placeholder="EBU3B B250"
                />
              </div>
            </div>

            <div className="form-section">
              <p className="section-label">Attendance</p>
              {isRepeatingSeriesCreate && (
                <p className="field-hint">
                  Optionally set a check-in code prefix. The server generates a unique suffix for each occurrence (e.g.
                  YOURCODE-aB3z). Leave blank to use server defaults.
                </p>
              )}
              {isRepeatedGroup && !showAttendanceCode && (
                <p className="field-hint">
                  Check-in codes are per occurrence. Switch to &quot;This instance only&quot; to edit the code for this
                  date.
                </p>
              )}
              <div className="field-row">
                <div className="field-group">
                  <label>
                    Check-in Code{" "}
                    {showAttendanceCode && !isRepeatingSeriesCreate ? <span className="required-mark">*</span> : null}
                    {showAttendanceCode && isRepeatingSeriesCreate ? (
                      <span className="optional-mark">optional prefix for generated codes</span>
                    ) : null}
                    {!showAttendanceCode ? <span className="optional-mark">— set per instance</span> : null}
                  </label>
                  <input
                    type="text"
                    value={event.attendanceCode}
                    name="attendanceCode"
                    onChange={handleChange}
                    placeholder="e.g. HACK2025"
                    disabled={!showAttendanceCode}
                  />
                </div>
                <div className="field-group">
                  <label>
                    Points <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    value={event.attendancePoints}
                    name="attendancePoints"
                    onChange={handleChange}
                    placeholder="10"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <p className="section-label">
                Description <span className="optional-mark">optional</span>
              </p>
              <div className="field-group">
                <textarea
                  value={event.description ?? ""}
                  name="description"
                  onChange={handleChange}
                  onKeyUp={resizeTextArea}
                  placeholder="Tell people what this event is about..."
                />
              </div>
            </div>

            {/* Marketing */}
            <div className="form-section">
              <p className="section-label">
                Marketing <span className="optional-mark">optional</span>
              </p>

              <div className="multi-select" ref={multiSelectRef}>
                <div
                  className={`multi-select-trigger${event.platforms.length === 0 ? " is-placeholder" : ""}`}
                  onClick={() => setIsPlatformsOpen(!isPlatformsOpen)}>
                  {/* Chips */}
                  {event.platforms.length === 0
                    ? "Select platforms..."
                    : Config.platforms
                        .filter(opt => event.platforms.includes(opt))
                        .map(opt => (
                          <span key={opt} className="multi-select-chip">
                            <span className="chip-label">{opt}</span>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleTogglePlatform(opt);
                              }}>
                              ✕
                            </button>
                          </span>
                        ))}
                  <i className={`fa fa-chevron-${isPlatformsOpen ? "up" : "down"}`} />
                </div>
                {isPlatformsOpen && (
                  <div className="multi-select-menu">
                    {Config.platforms.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        className={event.platforms.includes(opt) ? "selected" : ""}
                        onClick={() => handleTogglePlatform(opt)}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-preview">
            <p className="preview-label">Preview</p>
            {renderPreviewCard()}
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
                    checked={deleteScope === "single"}
                    onChange={() => setDeleteScope("single")}
                  />
                  <span>This instance only</span>
                </label>
                <label className="radio-row">
                  <input
                    type="radio"
                    name="deleteScope"
                    checked={deleteScope === "all"}
                    onChange={() => setDeleteScope("all")}
                  />
                  <span>Entire series</span>
                </label>
                <label className="radio-row">
                  <input
                    type="radio"
                    name="deleteScope"
                    checked={deleteScope === "fromInstance"}
                    onChange={() => setDeleteScope("fromInstance")}
                  />
                  <span>This instance and future</span>
                </label>
              </div>
            ) : (
              <p className="delete-confirm-body">This cannot be undone.</p>
            )}
            <div className="delete-confirm-actions">
              <Button onClick={() => setShowDeleteConfirm(false)} style="red" text="Cancel" icon="" />
              <Button onClick={confirmDelete} style="green" text="Confirm delete" icon="" />
            </div>
          </div>
        )}

        <div className="modal-footer">
          <div className="modal-footer-left">
            {isEdit && onDeleteEvent && (
              <Button onClick={() => setShowDeleteConfirm(true)} style="red" text="Delete" icon="" />
            )}
          </div>
          <div className="modal-footer-right">
            <Button onClick={onClickCancel} style="red" text="Cancel" icon="" />
            <Button onClick={handleSubmit} style="green" text={isEdit ? "Update Event" : "Create Event"} icon="" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAddEvent;

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
