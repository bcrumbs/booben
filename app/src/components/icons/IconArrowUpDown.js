import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

export const IconArrowUpDown = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <path d="M7,15l5,5l5-5H7z" />
        <path d="M17,9l-5-5L7,9H17z" />
      </g>
    </svg>
  </IconSvg>
);

IconArrowUpDown.propTypes = IconSvg.propTypes;
IconArrowUpDown.defaultProps = defaultProps;
IconArrowUpDown.displayName = 'IconArrowUpDown';
