import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

export const IconLink = props => (
  <IconSvg {...props} />
);

IconLink.propTypes = IconSvg.propTypes;
IconLink.defaultProps = defaultProps;
IconLink.displayName = 'IconLink';
