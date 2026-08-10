'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Config from '@/lib/config';
import './style.scss';

/**
 * Strips stored HTML down to readable text for the card's back face.
 *
 * Descriptions come from a rich-text field, so they arrive as markup. Falls back to a regex
 * pass when DOMParser is unavailable (server render).
 */
const plainText = (description) => {
  if (description == null) return '';
  const text = String(description)
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/\s*p\s*>/gi, '\n\n')
    .replace(/<\s*\/\s*div\s*>/gi, '\n\n');

  if (typeof DOMParser === 'undefined') {
    return text.replace(/<[^>]*>/g, '').replace(/\n{3,}/g, '\n\n').trim();
  }
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
};

/**
 * The vertical event card, shared by the home dashboard, the events list, and the event form's
 * live preview.
 *
 * Extracted from `adminAddEvent.js` so there is exactly one event card in the product; it was
 * previously reachable only from inside that file, with styles nested under `.admin-dashboard`.
 *
 * The cover falls back to the committee banner and then the logo — most stored covers are dead
 * links, so that path does real work.
 *
 * @param fill  stretch to the container's width. Only for a *grid* parent: in the events
 *   page's wrapping flexbox a full-width card takes a whole row and the cards stack.
 */
export default function EventPreviewCard({
  event, fill, onRsvp, going, flippable,
}) {
  const banner = Config.committeeBanners[event.committee] || '/logo.png';
  const [src, setSrc] = useState(event.cover || banner);
  const [flipped, setFlipped] = useState(false);

  const committeeColors = Object.fromEntries(Config.committeeColors);
  const committee = event.committee || 'ACM';
  const color = committeeColors[committee] || '#1E6CFF';

  const start = event.startDate ? moment(event.startDate) : null;
  const end = event.endDate ? moment(event.endDate) : null;

  let when = 'Date TBD';
  if (start && end) {
    when = `${start.format('MMM D, YYYY')}, ${start.format('h:mm a')} – ${end.format('h:mm a')}`;
  } else if (start) {
    when = start.format('MMM D, YYYY, h:mm a');
  }

  const description = plainText(event.description);
  const canFlip = flippable && !!description;

  return (
    <div className={`preview-card-container ${fill ? 'fill' : ''} ${flipped ? 'is-flipped' : ''}`}>
      <div className="preview-card-flipper">
        <div
          className="preview-card preview-card-front"
          onClick={canFlip ? () => setFlipped(true) : undefined}
          style={canFlip ? { cursor: 'pointer' } : undefined}
          title={canFlip ? 'Click to see description' : undefined}
        >
          <div className="preview-image-container">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              onError={() => setSrc((current) => (current === banner ? '/logo.png' : banner))}
            />
            <div className="preview-points-pill">{event.attendancePoints ?? 0} PTS</div>
          </div>

          <div className="preview-text-container">
            <p className="preview-title">{event.title || 'Event Title'}</p>
            <p className="preview-meta">🗓️ {when}</p>
            <p className="preview-meta">📍 {event.location || 'Location TBD'}</p>
            <p className="preview-meta" style={{ color }}>{committee}</p>
            {onRsvp ? (
              <button
                type="button"
                className="preview-rsvp-pill"
                // The card flips on click, so the button must not bubble into it.
                onClick={(e) => { e.stopPropagation(); onRsvp(event); }}
                style={going ? { background: 'rgba(52,220,106,0.18)', color: '#248a45' } : undefined}
              >
                {going ? 'Going' : 'RSVP'}
              </button>
            ) : (
              <div className="preview-rsvp-pill">RSVP</div>
            )}
          </div>
        </div>

        {canFlip && (
          <div className="preview-card preview-card-back">
            <div className="preview-back-content">
              <button type="button" className="preview-flip-back-btn" onClick={() => setFlipped(false)}>
                <i className="fa fa-arrow-left" aria-hidden="true" /> Back
              </button>
              <h3>{event.title}</h3>
              <div className="preview-description-scroll">
                <p>{description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

EventPreviewCard.propTypes = {
  event: PropTypes.object.isRequired,
  fill: PropTypes.bool,
  onRsvp: PropTypes.func,
  going: PropTypes.bool,
  flippable: PropTypes.bool,
};

EventPreviewCard.defaultProps = {
  fill: false, onRsvp: null, going: false, flippable: true,
};
