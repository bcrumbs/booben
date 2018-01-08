import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconCollapse = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <polygon points="4.7,3.3 3.3,4.7 7.3,8.7 5,11 11,11 11,5 8.7,7.3" />
        <polygon points="7.3,15.3 3.3,19.3 4.7,20.7 8.7,16.7 11,19 11,13 5,13" />
        <polygon points="19,13 13,13 13,19 15.3,16.7 19.3,20.7 20.7,19.3 16.7,15.3" />
        <polygon points="16.7,8.7 20.7,4.7 19.3,3.3 15.3,7.3 13,5 13,11 19,11" />
      </g>
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconCollapse.propTypes = IconSvg.propTypes;
IconCollapse.defaultProps = defaultProps;
IconCollapse.displayName = 'IconCollapse';
