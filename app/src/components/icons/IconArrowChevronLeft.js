import React from 'react';

import {
  IconArrowChevronLeft as IconArrowChevronLeftRCTCL,
} from 'reactackle-icons';

import defaultProps from './common/defaultProps';

export const IconArrowChevronLeft = props => (
  <IconArrowChevronLeftRCTCL {...props} />
);

IconArrowChevronLeft.propTypes = IconArrowChevronLeftRCTCL.propTypes;
IconArrowChevronLeft.defaultProps = defaultProps;
IconArrowChevronLeft.displayName = 'IconArrowChevronLeft';
