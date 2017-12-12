import React from 'react';
import { IconSvg } from 'reactackle-icons';
import { defaultProps } from './index';

export const IconBrush = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <path d="M7,14c-1.7,0-3,1.3-3,3c0,1.3-1.2,2-2,2c0.9,1.2,2.5,2,4,2c2.2,0,4-1.8,4-4C10,15.3,8.7,14,7,14z"/>
      <g>
        <path d="M11.6,14.6l-2.1-2.1L17.9,4c0.6-0.6,1.5-0.6,2.1,0l0,0c0.6,0.6,0.6,1.5,0,2.1L11.6,14.6z"/>
      </g>
    </svg>
  </IconSvg>
);

IconBrush.defaultProps = defaultProps;
