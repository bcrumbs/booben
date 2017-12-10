import React from 'react';
import { IconSvg } from 'reactackle-icons';
import { defaulProps } from './index';

export const IconUpload = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <path d="M15.4,12.6l-0.7,0.7l-0.8-0.8c0.7-1,1.1-2.2,1.1-3.5c0-3.3-2.7-6-6-6S3,5.7,3,9c0,3.3,2.7,6,6,6c1.3,0,2.5-0.4,3.5-1.1
      l0.8,0.8l-0.7,0.7l6,6l0.7-0.7l1.4-1.4l0.7-0.7L15.4,12.6z M9,13c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S11.2,13,9,13z" />
    </svg>
  </IconSvg>
);

IconUpload.defaulProps = defaulProps;



