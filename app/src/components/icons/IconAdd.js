import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconAdd = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <g>
        <path d="M12,22.5C6.2,22.5,1.5,17.8,1.5,12S6.2,1.5,12,1.5S22.5,6.2,22.5,12S17.8,22.5,12,22.5z M12,3.5c-4.7,0-8.5,3.8-8.5,8.5
			s3.8,8.5,8.5,8.5s8.5-3.8,8.5-8.5S16.7,3.5,12,3.5z"/>
      </g>
      <g>
        <rect x="11" y="7.2" width="2" height="9.5"/>
      </g>
      <g>
        <rect x="7.3" y="11" width="9.4" height="2"/>
      </g>
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconAdd.propTypes = IconSvg.propTypes;
IconAdd.defaultProps = defaultProps;
IconAdd.displayName = 'IconAdd';
