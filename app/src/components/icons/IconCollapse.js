import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconCollapse = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <polygon points="11,11 3,11 3,9 9,9 9,3 11,3 		"/>
      </g>
      <g>
        <polygon points="21,11 13,11 13,3 15,3 15,9 21,9 		"/>
      </g>
      <g>
        <polygon points="15,21 13,21 13,13 21,13 21,15 15,15 		"/>
      </g>
      <g>
        <polygon points="11,21 9,21 9,15 3,15 3,13 11,13 		"/>
      </g>
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconCollapse.propTypes = IconSvg.propTypes;
IconCollapse.defaultProps = defaultProps;
IconCollapse.displayName = 'IconCollapse';
