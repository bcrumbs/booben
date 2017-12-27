import React from 'react';
import { IconSvg } from '@reactackle/reactackle';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconLibrary = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <path
        d="M12,1C5.9,1,1,5.9,1,12c0,6.1,4.9,11,11,11s11-4.9,11-11C23,5.9,18.1,1,12,1z M12,21c-5,0-9-4-9-9s4-9,9-9c5,0,9,4,9,9
          S17,21,12,21z"
      />
      <polygon points="13,7 11,7 11,11 7,11 7,13 11,13 11,17 13,17 13,13 17,13 17,11 13,11" />
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconLibrary.propTypes = IconSvg.propTypes;
IconLibrary.defaultProps = defaultProps;
IconLibrary.displayName = 'IconLibrary';
