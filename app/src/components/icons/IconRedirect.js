import React from 'react';
import { IconSvg } from 'reactackle-icons';
import { defaultProps } from './index';

export const IconRedirect = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <path d="M9,17H7c-1.1,0-2-0.9-2-2c0-1.1,0.9-2,2-2h9c2.2,0,4-1.8,4-4s-1.8-4-4-4H3v2h13c1.1,0,2,0.9,2,2s-0.9,2-2,2H7
		c-2.2,0-4,1.8-4,4c0,2.2,1.8,4,4,4h2v2.2l3.2-3.2L9,14.8V17z"/>
        <rect x="14" y="17" width="6" height="2"/>
      </g>
    </svg>
  </IconSvg>
);

IconRedirect.defaultProps = defaultProps;
