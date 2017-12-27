import React from 'react';

import {
  IconArrowChevronRight as IconArrowChevronRightRCTCL,
} from '@reactackle/reactackle';

import defaultProps from './common/defaultProps';

export const IconArrowChevronRight = props => (
  <IconArrowChevronRightRCTCL {...props} />
);

IconArrowChevronRight.propTypes = IconArrowChevronRightRCTCL.propTypes;
IconArrowChevronRight.defaultProps = defaultProps;
IconArrowChevronRight.displayName = 'IconArrowChevronRight';
