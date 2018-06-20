import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconCut = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <path
        d="M9.8,7.9c0.2-0.5,0.3-1,0.3-1.6c0-2.1-1.7-3.8-3.8-3.8S2.5,4.2,2.5,6.3s1.7,3.8,3.8,3.8c0.6,0,1.1-0.1,1.6-0.3l2.2,2.2
				l-2.2,2.2c-0.5-0.2-1-0.3-1.6-0.3c-2.1,0-3.8,1.7-3.8,3.8s1.7,3.8,3.8,3.8s3.8-1.7,3.8-3.8c0-0.6-0.1-1.1-0.3-1.6l2.2-2.2
				l6.6,6.6h2.9v-0.9L9.8,7.9z M6.3,8.2c-1,0-1.9-0.8-1.9-1.9s0.9-1.9,1.9-1.9s1.9,0.8,1.9,1.9S7.3,8.2,6.3,8.2z M6.3,19.6
				c-1,0-1.9-0.8-1.9-1.9s0.9-1.9,1.9-1.9s1.9,0.8,1.9,1.9S7.3,19.6,6.3,19.6z M12,12.5c-0.3,0-0.5-0.2-0.5-0.5s0.2-0.5,0.5-0.5
				s0.5,0.2,0.5,0.5S12.3,12.5,12,12.5z M18.6,3.5l-5.7,5.7l1.9,1.9l6.6-6.7v-1H18.6z"
      />
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconCut.propTypes = IconSvg.propTypes;
IconCut.defaultProps = defaultProps;
IconCut.displayName = 'IconCut';
