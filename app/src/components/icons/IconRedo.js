import React from 'react';
import { IconSvg } from '@reactackle/reactackle';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconRedo = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <path
        d="M19.8,11V3l-3.4,3.4C15,5,13,4.1,10.9,4.1C6.5,4.1,3,7.6,3,11.9c0,4.4,3.5,7.9,7.9,7.9c2,0,4-0.8,5.6-2.3l-1.4-1.5
          c-1.2,1.1-2.7,1.7-4.2,1.7c-3.3,0-5.9-2.6-5.9-5.9c0-3.2,2.6-5.8,5.9-5.8c1.5,0,3,0.6,4.1,1.7L11.8,11H19.8z"
      />
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconRedo.propTypes = IconSvg.propTypes;
IconRedo.defaultProps = defaultProps;
IconRedo.displayName = 'IconRedo';
