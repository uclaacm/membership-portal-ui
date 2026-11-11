'use client';

import React from 'react';

export default function YearSelector({ value, target, onChange }) {
  return (
    <select className="profile-select" onChange={onChange} name={target} value={value}>
      <option value={1}>Freshman</option>
      <option value={2}>Sophomore</option>
      <option value={3}>Junior</option>
      <option value={4}>Senior</option>
      <option value={5}>Post-Senior</option>
    </select>
  );
}
