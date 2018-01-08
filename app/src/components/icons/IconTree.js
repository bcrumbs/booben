import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

export const IconTree = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <rect x="4" y="4" width="17" height="4" />
        <rect x="11" y="10" width="10" height="4" />
        <rect x="11" y="15" width="10" height="4" />
        <polygon points="7,9 5,9 5,18 9,18 9,16 7,16 7,13 9,13 9,11 7,11" />
      </g>
    </svg>
  </IconSvg>
);

IconTree.propTypes = IconSvg.propTypes;
IconTree.defaultProps = defaultProps;
IconTree.displayName = 'IconTree';
