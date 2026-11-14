'use client';

import type { ComponentPropsWithRef, CSSProperties } from 'react';

const caretStyles: CSSProperties = {
  appearance: 'none',
  paddingRight: 36,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='m2 4 4 4 4-4' fill='none' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
};

/** Native select behavior with a consistently inset caret. Accepts native props and refs. */
export default function DropdownSelect({
  style,
  multiple,
  size,
  ...props
}: ComponentPropsWithRef<'select'>) {
  const isListbox = multiple || (size !== undefined && size > 1);

  return (
    <select
      {...props}
      multiple={multiple}
      size={size}
      // Keep caret geometry independent of page-specific padding and background shorthands.
      style={isListbox ? style : { ...caretStyles, ...style }}
    />
  );
}
