'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Config from '@/lib/config';
import { PageHeader, ApiLegend, SearchField, Select } from '../components/primitives';
import { formatBytes, formatCount, imageFilename } from '../format';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All files' },
  { value: 'unused', label: 'Unused only' },
  { value: 'large', label: 'Larger than 1 MB' },
];

const ONE_MB = 1024 * 1024;

export default function Media({ images, onDelete }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const visible = images.filter((image) => {
    const name = imageFilename(image);
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'unused') return !image.referenceCount;
    if (filter === 'large') return (image.size || 0) > ONE_MB;
    return true;
  });

  const storedBytes = images.reduce((sum, image) => sum + (image.size || 0), 0);

  return (
    <>
      <PageHeader
        title="Media"
        subtitle="Uploaded images, their size, and what still references them."
      />

      <div className="cp-toolbar">
        <SearchField value={search} onChange={setSearch} placeholder="Search filenames" />
        <Select label="Filter files" value={filter} onChange={setFilter} options={FILTER_OPTIONS} />
        <div className="cp-toolbar-right">
          <span className="cp-toolbar-meta">
            {formatCount(images.length)} files · {formatBytes(storedBytes)} stored
          </span>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="cp-empty">No images match these filters.</div>
      ) : (
        <div className="cp-media-grid">
          {visible.map((image) => {
            const references = image.referenceCount ?? 0;
            return (
              <div className="cp-media-tile" key={image.uuid}>
                <div
                  className="cp-media-thumb"
                  style={{
                    backgroundImage: `url(${Config.API_URL}${Config.routes.image.specific}/${image.uuid})`,
                  }}
                />
                <div className="cp-media-body">
                  <span className="cp-media-name" title={image.uuid}>{imageFilename(image)}</span>
                  <span className="cp-media-meta">
                    {formatBytes(image.size)}
                    {image.width && image.height ? ` · ${image.width}×${image.height}` : ''}
                  </span>
                  <div className="cp-media-footer">
                    <span className={`cp-media-usage ${references === 0 ? 'unused' : ''}`}>
                      {references === 0
                        ? 'Unused'
                        : `${references} event${references === 1 ? '' : 's'}`}
                    </span>
                    <button type="button" onClick={() => onDelete(image)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ApiLegend />
    </>
  );
}

Media.propTypes = {
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  onDelete: PropTypes.func.isRequired,
};
