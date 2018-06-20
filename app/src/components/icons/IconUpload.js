import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

export const IconUpload = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <polygon points="13 11 13 3 11 3 11 11 7 11 12 16 17 11 13 11"/>
      <polygon points="19 14 19 19 5 19 5 14 3 14 3 19 3 21 5 21 19 21 21 21 21 19 21 14 19 14"/>
    </svg>
  </IconSvg>
);

IconUpload.propTypes = IconSvg.propTypes;
IconUpload.defaultProps = defaultProps;
IconUpload.displayName = 'IconUpload';
