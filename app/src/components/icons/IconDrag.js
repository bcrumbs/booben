import React from 'react';
import { IconSvg } from '@reactackle/reactackle';
import { defaultProps } from './index';

export const IconDrag = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <circle cx="8" cy="14.7" r="2" />
        <circle cx="8" cy="20" r="2" />
        <circle cx="8" cy="9.3" r="2" />
        <circle cx="8" cy="4" r="2" />
      </g>
      <g>
        <circle cx="16" cy="14.7" r="2" />
        <circle cx="16" cy="20" r="2" />
        <circle cx="16" cy="9.3" r="2" />
        <circle cx="16" cy="4" r="2" />
      </g>
    </svg>
  </IconSvg>
);

IconDrag.defaultProps = defaultProps;

