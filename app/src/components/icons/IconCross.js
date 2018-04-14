import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

export const IconCross = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <rect fill='#fff' x="11" y="2.8" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -4.9706 12)" width="2" height="18.4"/>
      </g>
      <g>
        <rect fill='#fff' x="2.8" y="11" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -4.9706 12)" width="18.4" height="2"/>
      </g>
    </svg>
  </IconSvg>
);

IconCross.propTypes = IconSvg.propTypes;
IconCross.defaultProps = defaultProps;
IconCross.displayName = 'IconCross';
