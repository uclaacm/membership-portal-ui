'use client';

import PropTypes from 'prop-types';

/** Rounded status pill. `tone` selects the palette; see style.scss `.cp-pill`. */
export function Pill({ tone, children }) {
  return <span className={`cp-pill ${tone}`}>{children}</span>;
}

Pill.propTypes = {
  tone: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

/** Square-cornered neutral tag, used for committee chips inside table cells. */
export function Tag({ children }) {
  return <span className="cp-tag">{children}</span>;
}

Tag.propTypes = { children: PropTypes.node.isRequired };

/** A group of committee chips. Renders an em dash when a user has no committees. */
export function TagGroup({ items }) {
  if (!items || items.length === 0) return <>&mdash;</>;
  return (
    <span className="cp-tag-group">
      {items.map((item) => <Tag key={item}>{item}</Tag>)}
    </span>
  );
}

TagGroup.propTypes = { items: PropTypes.arrayOf(PropTypes.string) };
TagGroup.defaultProps = { items: [] };

/**
 * Marks a field the API cannot supply yet. Rendered as a blue dagger matching the footer
 * legend that appears on every section.
 */
export function Dagger() {
  return <span className="cp-dagger" title="Not available from the current API">†</span>;
}

/** Stat tile for the Overview section. */
export function StatTile({
  label, value, delta, deltaColor, needsApi,
}) {
  return (
    <div className="cp-stat-tile">
      <span className="cp-stat-label">
        {label}
        {needsApi && <> <Dagger /></>}
      </span>
      <span className="cp-stat-value">{value}</span>
      {delta && <span className="cp-stat-delta" style={{ color: deltaColor }}>{delta}</span>}
    </div>
  );
}

StatTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  delta: PropTypes.node,
  deltaColor: PropTypes.string,
  needsApi: PropTypes.bool,
};

StatTile.defaultProps = { delta: null, deltaColor: 'rgba(0,0,0,0.45)', needsApi: false };

/** Uppercase section heading with an optional count and right-hand action cluster. */
export function SectionHead({
  title, count, baseline, children,
}) {
  return (
    <div className={`cp-section-head ${baseline ? 'baseline' : ''}`}>
      <h2>
        {title}
        {count !== null && count !== undefined && <span className="cp-head-count">{count}</span>}
      </h2>
      {children && <div className="cp-head-actions">{children}</div>}
    </div>
  );
}

SectionHead.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.node,
  baseline: PropTypes.bool,
  children: PropTypes.node,
};

SectionHead.defaultProps = { count: null, baseline: false, children: null };

/** Page title and subtitle at the top of each section. */
export function PageHeader({ title, subtitle }) {
  return (
    <div className="cp-page-header">
      <h1>{title}</h1>
      <p className="cp-page-subtitle">{subtitle}</p>
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
};

/** Search input with the leading magnifier icon. */
export function SearchField({ value, onChange, placeholder }) {
  return (
    <div className="cp-search">
      <i className="fa fa-search" aria-hidden="true" />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
    </div>
  );
}

SearchField.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
};

/** Labelled select used across the toolbars. */
export function Select({
  value, onChange, options, label,
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

Select.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  label: PropTypes.string.isRequired,
};

/** Footer legend shown on every section, explaining the dagger. */
export function ApiLegend() {
  return (
    <div className="cp-legend">
      <span className="cp-dagger">†</span>
      {' '}
      Not available from the current API — needs a new endpoint or field.
    </div>
  );
}
