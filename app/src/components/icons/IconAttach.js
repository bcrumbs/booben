import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconAttach = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <g>
          <g>
            <polygon points="11,17 11,7 16,12 				"/>
          </g>
        </g>
      </g>
      <g>
        <rect x="3" y="11" width="9" height="2"/>
      </g>
      <g>
        <rect x="18" y="2.5" width="2" height="19"/>
      </g>
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconAttach.propTypes = IconSvg.propTypes;
IconAttach.defaultProps = defaultProps;
IconAttach.displayName = 'IconAttach';
