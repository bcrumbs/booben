import React from 'react';
import { IconSvg } from '@reactackle/reactackle';
import { defaultProps } from './index';

/* eslint-disable max-len */
export const IconRedirect = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <path
        d="M19,15h-2.6l-3-3l3-3H19v2l3-3l-3-3v2h-3c-0.3,0-0.5,0.1-0.7,0.3L12,10.6L8.7,7.3C8.5,7.1,8.3,7,8,7H3.4v2h4.2l3,3l-3,3H3.4
          v2H8c0.3,0,0.5-0.1,0.7-0.3l3.3-3.3l3.3,3.3c0.2,0.2,0.4,0.3,0.7,0.3h3v2l3-3l-3-3V15z"
      />
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconRedirect.defaultProps = defaultProps;
