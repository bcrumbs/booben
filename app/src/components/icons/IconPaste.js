import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconPaste = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <path d="M18.7,2.4h-4c-0.4-1.1-1.5-1.9-2.7-1.9S9.7,1.3,9.3,2.4h-4c-1.1,0-1.9,0.9-1.9,1.9v15.3c0,1,0.9,1.9,1.9,1.9h13.4
				c1.1,0,1.9-0.9,1.9-1.9V4.3C20.6,3.3,19.7,2.4,18.7,2.4z M12,2.4c0.5,0,1,0.4,1,1s-0.4,1-1,1s-1-0.4-1-1S11.5,2.4,12,2.4z
				 M18.7,19.6H5.3V4.3h1.9v2.9h9.5V4.3h1.9V19.6z"/>
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconPaste.propTypes = IconSvg.propTypes;
IconPaste.defaultProps = defaultProps;
IconPaste.displayName = 'IconPaste';
