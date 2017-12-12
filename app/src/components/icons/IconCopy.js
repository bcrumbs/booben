import React from 'react';
import { IconSvg } from 'reactackle-icons';
import { defaultProps } from './index';

export const IconCopy = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <path d="M20,7H8C7.4,7,7,7.4,7,8v12c0,0.6,0.4,1,1,1h12c0.6,0,1-0.4,1-1V8C21,7.4,20.6,7,20,7z M19,19H9V9h10V19z"/>
        <path d="M17,3H4C3.4,3,3,3.4,3,4v14h2V5h12V3z"/>
      </g>
    </svg>
  </IconSvg>
);

IconCopy.defaultProps = defaultProps;
