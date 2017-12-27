import React from 'react';
import { IconSvg } from '@reactackle/reactackle';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconUndo = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <path
        d="M12.9,4.1c-2.1,0-4.1,0.9-5.5,2.3L4,3v8h8L8.8,7.8c1.1-1,2.6-1.7,4.1-1.7c3.3,0,5.9,2.6,5.9,5.9s-2.6,5.9-5.9,5.9
        c-1.5,0-3-0.6-4.2-1.7l-1.4,1.5c1.6,1.5,3.6,2.3,5.6,2.3c4.4,0,7.9-3.5,7.9-7.9S17.3,4.1,12.9,4.1z"
      />
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconUndo.propTypes = IconSvg.propTypes;
IconUndo.defaultProps = defaultProps;
IconUndo.displayName = 'IconUndo';
