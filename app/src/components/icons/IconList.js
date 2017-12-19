import React from 'react';
import { IconSvg } from '@reactackle/reactackle';
import { defaultProps } from './index';

/* eslint-disable max-len */
export const IconList = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <rect x="2" y="4" width="12" height="2" />
        <rect x="2" y="8" width="8" height="2" />
        <polygon points="12,8 12,13 14,13 14,10 19,10 19,12 22,9 19,6 19,8" />
        <polygon points="20,16 15,16 15,14 12,17 15,20 15,18 22,18 22,13 20,13" />
        <rect x="2" y="12" width="8" height="2" />
      </g>
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconList.defaultProps = defaultProps;
