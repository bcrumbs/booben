import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

export const IconLink = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <path d="M11,17.5H6.5C3.5,17.5,1,15,1,12s2.5-5.5,5.5-5.5H11v2H6.5C4.6,8.5,3,10.1,3,12s1.6,3.5,3.5,3.5H11V17.5z"/>
        <path d="M17.5,17.5H13v-2h4.5c1.9,0,3.5-1.6,3.5-3.5s-1.6-3.5-3.5-3.5H13v-2h4.5c3,0,5.5,2.5,5.5,5.5S20.5,17.5,17.5,17.5z"/>
      </g>
      <g>
        <rect x="8" y="11" width="8" height="2"/>
      </g>
    </svg>
  </IconSvg>
);

IconLink.propTypes = IconSvg.propTypes;
IconLink.defaultProps = defaultProps;
IconLink.displayName = 'IconLink';
