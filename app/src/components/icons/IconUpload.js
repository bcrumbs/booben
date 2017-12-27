import React from 'react';
import { IconSvg } from '@reactackle/reactackle';
import defaultProps from './common/defaultProps';

export const IconUpload = props => (
  <IconSvg {...props} />
);

IconUpload.propTypes = IconSvg.propTypes;
IconUpload.defaultProps = defaultProps;
IconUpload.displayName = 'IconUpload';
