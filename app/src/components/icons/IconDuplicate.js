import React from 'react';
import { IconSvg } from '@reactackle/reactackle';
import { defaultProps } from './index';

/* eslint-disable max-len */
export const IconDuplicate = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <path d="M20,7H8C7.4,7,7,7.4,7,8v12c0,0.6,0.4,1,1,1h12c0.6,0,1-0.4,1-1V8C21,7.4,20.6,7,20,7z M19,19H9V9h10V19z" />
        <path d="M17,3H4C3.4,3,3,3.4,3,4v14h2V5h12V3z" />
        <polygon points="13,17 15,17 15,15 17,15 17,13 15,13 15,11 13,11 13,13 11,13 11,15 13,15" />
      </g>
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconDuplicate.defaultProps = defaultProps;

