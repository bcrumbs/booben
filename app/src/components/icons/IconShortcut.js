import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

export const IconShortcut = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <path
          d="M18.1,14.5h-1.5v-5h1.5c1.9,0,3.4-1.5,3.4-3.4c0-2-1.6-3.6-3.6-3.6c-1.9,0-3.4,1.5-3.4,3.4v1.6h-5V5.9C9.5,4,8,2.5,6.1,2.5
		c-2,0-3.6,1.6-3.6,3.6C2.5,8,4,9.5,5.9,9.5h1.7v5H5.9c-1.9,0-3.4,1.5-3.4,3.4c0,2,1.6,3.6,3.6,3.6c1.9,0,3.4-1.5,3.4-3.4v-1.6h5
		v1.6c0,1.9,1.5,3.4,3.4,3.4c2,0,3.6-1.6,3.6-3.6C21.5,16,20,14.5,18.1,14.5z M16.5,5.9c0-0.8,0.6-1.4,1.4-1.4
		c0.9,0,1.6,0.7,1.6,1.6c0,0.8-0.6,1.4-1.4,1.4h-1.5h-0.1V5.9z M7.5,7.5H5.9c-0.8,0-1.4-0.6-1.4-1.4c0-0.9,0.7-1.6,1.6-1.6
		c0.8,0,1.4,0.6,1.4,1.4V7.5z M7.5,18.1c0,0.8-0.6,1.4-1.4,1.4c-0.9,0-1.6-0.7-1.6-1.6c0-0.8,0.6-1.4,1.4-1.4h1.6V18.1z M9.6,14.5
		v-5h4.9h0.1v5h-0.1H9.6z M17.9,19.5c-0.8,0-1.4-0.6-1.4-1.4v-1.6h0.1h1.5c0.8,0,1.4,0.6,1.4,1.4C19.5,18.8,18.8,19.5,17.9,19.5z"
        />
      </g>
    </svg>
  </IconSvg>
);

IconShortcut.propTypes = IconSvg.propTypes;
IconShortcut.defaultProps = defaultProps;
IconShortcut.displayName = 'IconShortcut';
