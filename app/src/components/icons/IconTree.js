import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

export const IconTree = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <rect x="10.6" y="10" width="10" height="4" />
      </g>
      <g>
        <rect x="3.4" y="4" width="10" height="4" />
      </g>
      <g>
        <rect x="10.6" y="16" width="10" height="4" />
      </g>
      <g>
        <polygon points="10.6,18.5 6.1,18.5 6.1,8 7.1,8 7.1,17.5 10.6,17.5 		" />
      </g>
      <g>
        <rect x="6.6" y="11.5" width="4" height="1" />
      </g>
    </svg>
  </IconSvg>
);

IconTree.propTypes = IconSvg.propTypes;
IconTree.defaultProps = defaultProps;
IconTree.displayName = 'IconTree';
