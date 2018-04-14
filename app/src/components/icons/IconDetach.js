import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconDetach = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <g>
          <g>
            <polygon points="16,17 16,7 21,12 				"/>
          </g>
        </g>
      </g>
      <g>
        <rect x="8" y="11" width="8" height="2"/>
      </g>
      <g>
        <rect x="4" y="2.5" width="2" height="19"/>
      </g>
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconDetach.propTypes = IconSvg.propTypes;
IconDetach.defaultProps = defaultProps;
IconDetach.displayName = 'IconDetach';
