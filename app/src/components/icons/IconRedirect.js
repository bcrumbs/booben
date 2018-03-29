import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconRedirect = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <polygon points="19,11.5 22.5,8 19,4.5 		"/>
      </g>
      <g>
        <polygon points="19,20.5 22.5,17 19,13.5 		"/>
      </g>
      <g>
        <path d="M6.8,18H2.2v-2h4.1L15,7.3C15.2,7.1,15.5,7,15.8,7h4v2h-3.6l-8.7,8.7C7.3,17.9,7,18,6.8,18z"/>
      </g>
      <g>
        <path d="M19.8,18h-4c-0.3,0-0.6-0.1-0.7-0.3L7.3,9H2.2V7h5.5C8,7,8.3,7.1,8.5,7.3l7.7,8.7h3.6V18z"/>
      </g>
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconRedirect.propTypes = IconSvg.propTypes;
IconRedirect.defaultProps = defaultProps;
IconRedirect.displayName = 'IconRedirect';
