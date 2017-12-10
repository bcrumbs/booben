import React from 'react';
import { IconSvg } from 'reactackle-icons';
import { defaulProps } from './index';

export const IconAdd = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <polygon points="20,11 13,11 13,4 11,4 11,11 4,11 4,13 11,13 11,20 13,20 13,13 20,13 " />
    </svg>
  </IconSvg>
);

IconAdd.defaulProps = defaulProps;
