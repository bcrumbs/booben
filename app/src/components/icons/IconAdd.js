import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconAdd = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <rect x="2.5" y="11" width="19" height="2" />
      </g>
      <g>
        <rect x="11" y="2.5" width="2" height="19" />
      </g>
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconAdd.propTypes = IconSvg.propTypes;
IconAdd.defaultProps = defaultProps;
IconAdd.displayName = 'IconAdd';
