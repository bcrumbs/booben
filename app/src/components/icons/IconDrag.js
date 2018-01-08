import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

export const IconDrag = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <circle cx="8" cy="14.7" r="2" />
        <circle cx="8" cy="20" r="2" />
        <circle cx="8" cy="9.3" r="2" />
        <circle cx="8" cy="4" r="2" />
      </g>
      <g>
        <circle cx="16" cy="14.7" r="2" />
        <circle cx="16" cy="20" r="2" />
        <circle cx="16" cy="9.3" r="2" />
        <circle cx="16" cy="4" r="2" />
      </g>
    </svg>
  </IconSvg>
);

IconDrag.propTypes = IconSvg.propTypes;
IconDrag.defaultProps = defaultProps;
IconDrag.displayName = 'IconDrag';
