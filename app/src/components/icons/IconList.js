import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconList = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <g>
          <g>
            <rect x="9.5" y="14" width="12.5" height="2"/>
          </g>
        </g>
      </g>
      <g>
        <g>
          <g>
            <rect x="9.5" y="18" width="12.5" height="2"/>
          </g>
        </g>
      </g>
      <g>
        <g>
          <g>
            <rect x="15.3" y="10" width="6.7" height="2"/>
          </g>
        </g>
      </g>
      <g>
        <g>
          <g>
            <polygon points="9.5,12.5 9.5,1.5 15,7 				"/>
          </g>
        </g>
      </g>
      <g>
        <polygon points="5,16 3,16 3,6 9.5,6 9.5,8 5,8 		"/>
      </g>
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconList.propTypes = IconSvg.propTypes;
IconList.defaultProps = defaultProps;
IconList.displayName = 'IconList';
