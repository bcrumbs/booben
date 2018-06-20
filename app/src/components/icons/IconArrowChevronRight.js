import React from 'react';

import { IconSvg } from 'reactackle-icons';

import defaultProps from './common/defaultProps';

export const IconArrowChevronRight = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <polygon points="8.7,21 7.3,19.6 15,12 7.3,4.4 8.7,3 17.9,12 		" />
    </svg>
  </IconSvg>
);

IconArrowChevronRight.propTypes = IconSvg.propTypes;
IconArrowChevronRight.defaultProps = defaultProps;
IconArrowChevronRight.displayName = 'IconArrowChevronRight';
