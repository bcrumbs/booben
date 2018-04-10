import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

export const IconDrag = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <rect x="9" y="2.5" width="2" height="19"/>
      </g>
      <g>
        <rect x="13" y="2.5" width="2" height="19"/>
      </g>
    </svg>
  </IconSvg>
);

IconDrag.propTypes = IconSvg.propTypes;
IconDrag.defaultProps = defaultProps;
IconDrag.displayName = 'IconDrag';
