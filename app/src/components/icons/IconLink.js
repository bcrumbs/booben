import React from 'react';
import { IconSvg } from '@reactackle/reactackle';
import { defaultProps } from './index';

export const IconLink = props => (
  <IconSvg {...props} />
);

IconLink.defaultProps = defaultProps;
