import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconPaste = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <path
        d="M19,2h-4.2c-0.4-1.2-1.5-2-2.8-2S9.6,0.8,9.2,2H5C3.9,2,3,2.9,3,4v16c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V4
          C21,2.9,20.1,2,19,2z M12,2c0.6,0,1,0.5,1,1s-0.4,1-1,1s-1-0.5-1-1S11.4,2,12,2z M19,20H5V4h2v3h10V4h2V20z"
      />
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconPaste.propTypes = IconSvg.propTypes;
IconPaste.defaultProps = defaultProps;
IconPaste.displayName = 'IconPaste';
