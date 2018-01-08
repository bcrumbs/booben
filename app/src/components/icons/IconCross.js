import React from 'react';
import { IconCross as IconCrossRCTCL } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

export const IconCross = props => (
  <IconCrossRCTCL {...props} />
);

IconCross.propTypes = IconCrossRCTCL.propTypes;
IconCross.defaultProps = defaultProps;
IconCross.displayName = 'IconCross';
