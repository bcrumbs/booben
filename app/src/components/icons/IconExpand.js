import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconExpand = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <polygon points="4,10 2,10 2,2 10,2 10,4 4,4 			" />
      </g>
      <g>
        <polygon points="22,10 20,10 20,4 14,4 14,2 22,2 			" />
      </g>
      <g>
        <polygon points="22,22 14,22 14,20 20,20 20,14 22,14 			" />
      </g>
      <g>
        <polygon points="10,22 2,22 2,14 4,14 4,20 10,20 			" />
      </g>
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconExpand.propTypes = IconSvg.propTypes;
IconExpand.defaultProps = defaultProps;
IconExpand.displayName = 'IconExpand';
