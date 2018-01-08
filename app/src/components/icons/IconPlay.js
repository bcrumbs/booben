import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconPlay = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <polygon points="9.3,17.5 16.7,12 9.3,6.5" />
        <path
          d="M12,1C5.9,1,1,5.9,1,12c0,6.1,4.9,11,11,11s11-4.9,11-11C23,5.9,18.1,1,12,1z M12,21c-5,0-9-4-9-9s4-9,9-9c5,0,9,4,9,9
          S17,21,12,21z"
        />
      </g>
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconPlay.propTypes = IconSvg.propTypes;
IconPlay.defaultProps = defaultProps;
IconPlay.displayName = 'IconPlay';
