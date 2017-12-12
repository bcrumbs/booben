import React from 'react';
import { IconSvg } from 'reactackle-icons';
import { defaultProps } from './index';

export const IconPencil = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <path d="M3,17.2V21h3.8L17.8,9.9l-3.8-3.8L3,17.2z M20.7,7c0.4-0.4,0.4-1,0-1.4l-2.3-2.3c-0.4-0.4-1-0.4-1.4,0l-1.8,1.8l3.8,3.8
        L20.7,7z"/>
    </svg>
  </IconSvg>
);

IconPencil.defaultProps = defaultProps;

