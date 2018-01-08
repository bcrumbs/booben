import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconExpand = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <polygon points="2,2 2,8 8,2" />
        <polygon points="2,22 8,22 2,16" />
        <polygon points="16,2 22,8 22,2" />
        <polygon points="22,22 22,16 16,22" />
        <polygon points="19.7,18.3 13.4,12 19.7,5.7 18.3,4.3 12,10.6 5.7,4.3 4.3,5.7 10.6,12 4.3,18.3 5.7,19.7 12,13.4 18.3,19.7" />
      </g>
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconExpand.propTypes = IconSvg.propTypes;
IconExpand.defaultProps = defaultProps;
IconExpand.displayName = 'IconExpand';
