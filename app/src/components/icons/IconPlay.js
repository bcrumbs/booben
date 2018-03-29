import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconPlay = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <polygon points="9.3,17.5 16.7,12 9.3,6.5" />
      </g>
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconPlay.propTypes = IconSvg.propTypes;
IconPlay.defaultProps = defaultProps;
IconPlay.displayName = 'IconPlay';
