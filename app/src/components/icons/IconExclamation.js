import React from 'react';
import { IconSvg } from 'reactackle-icons';
import { defaultProps } from './index';

export const IconExclamation = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <circle cx="12" cy="20" r="2" />
        <path d="M10,4h4v12h-4V4z" />
      </g>
    </svg>
  </IconSvg>
);

IconExclamation.defaultProps = defaultProps;
