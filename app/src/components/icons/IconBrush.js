import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconBrush = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <path
        d="M12,22.7c-4.6,0-8.3-3.7-8.3-8.3c0-4.3,6.8-12,7.5-12.9L12,0.8l0.7,0.8c0.8,0.9,7.5,8.6,7.5,12.9
			C20.3,19,16.6,22.7,12,22.7z M12,3.8c-2.3,2.7-6.3,8-6.3,10.7c0,3.5,2.8,6.3,6.3,6.3s6.3-2.8,6.3-6.3C18.3,11.8,14.3,6.5,12,3.8z"
      />
      <path d="M13,18.8c-2.7,0-4.9-2.2-4.9-4.9h2c0,1.6,1.3,2.9,2.9,2.9V18.8z" />
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconBrush.propTypes = IconSvg.propTypes;
IconBrush.defaultProps = defaultProps;
IconBrush.displayName = 'IconBrush';
