import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconExpand = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <polygon points="3,10 3,3 10,3 		"/>
      </g>
      <g>
        <polygon points="10,21 3,21 3,14 		"/>
      </g>
      <g>
        <polygon points="14,3 21,3 21,10 		"/>
      </g>
      <g>
        <polygon points="21,14 21,21 14,21 		"/>
      </g>
      <g>
        <rect x="11" y="2.1" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -4.9706 12)" width="2" height="19.8"/>
      </g>
      <g>
        <rect x="2.1" y="11" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -4.9706 12)" width="19.8" height="2"/>
      </g>
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconExpand.propTypes = IconSvg.propTypes;
IconExpand.defaultProps = defaultProps;
IconExpand.displayName = 'IconExpand';
