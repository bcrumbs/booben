import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconArrowForward = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <polygon points="12.7,4.3 11.3,5.7 16.6,11 5,11 5,13 16.6,13 11.3,18.3 12.7,19.7 20.4,12 " />
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconArrowForward.propTypes = IconSvg.propTypes;
IconArrowForward.defaultProps = defaultProps;
IconArrowForward.displayName = 'IconArrowForward';
