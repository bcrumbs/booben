import React from 'react';
import { IconSvg } from 'reactackle-icons';
import { defaultProps } from './index';

export const IconCut = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <path d="M9.6,7.6C9.9,7.1,10,6.6,10,6c0-2.2-1.8-4-4-4S2,3.8,2,6s1.8,4,4,4c0.6,0,1.1-0.1,1.6-0.4L10,12l-2.4,2.4
        C7.1,14.1,6.6,14,6,14c-2.2,0-4,1.8-4,4s1.8,4,4,4s4-1.8,4-4c0-0.6-0.1-1.1-0.4-1.6L12,14l7,7h3v-1L9.6,7.6z M6,8C4.9,8,4,7.1,4,6
        s0.9-2,2-2s2,0.9,2,2S7.1,8,6,8z M6,20c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S7.1,20,6,20z M12,12.5c-0.3,0-0.5-0.2-0.5-0.5
        s0.2-0.5,0.5-0.5s0.5,0.2,0.5,0.5S12.3,12.5,12,12.5z M19,3l-6,6l2,2l7-7V3H19z"/>
    </svg>
  </IconSvg>
);

IconCut.defaultProps = defaultProps;


