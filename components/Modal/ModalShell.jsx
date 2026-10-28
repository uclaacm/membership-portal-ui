'use client';

import { useEffect, useId, useRef } from 'react';
import PropTypes from 'prop-types';
import './style.scss';

export default function ModalShell({ title, subtitle, onClose, children, footer, wide = false }) {
  const titleId = useId();
  const descriptionId = useId();
  const panel = useRef(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);

  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const node = panel.current;
    node.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close.current();
      }
      if (event.key !== 'Tab') return;
      const elements = [...node.querySelectorAll('button, input, select, textarea, a[href], [tabindex="0"]')]
        .filter((element) => !element.disabled && element.getClientRects().length);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); node.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === node)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === node)) {
        event.preventDefault(); first.focus();
      }
    };
    node.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      node.removeEventListener('keydown', onKey);
      if (previous?.isConnected) previous.focus();
    };
  }, []);

  return (
    <div className="portal-modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={panel} className={`portal-modal${wide ? ' portal-modal--wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={subtitle ? descriptionId : undefined} tabIndex={-1}>
        <header className="portal-modal__header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {subtitle && <p id={descriptionId}>{subtitle}</p>}
          </div>
          <button type="button" className="portal-modal__close" onClick={onClose} aria-label="Close dialog">
            <i className="fa fa-xmark" aria-hidden="true" />
          </button>
        </header>
        <div className="portal-modal__body">{children}</div>
        {footer && <footer className="portal-modal__footer">{footer}</footer>}
      </section>
    </div>
  );
}

ModalShell.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  footer: PropTypes.node,
  wide: PropTypes.bool,
};
