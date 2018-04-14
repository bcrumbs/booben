import React from 'react';
import { IconSvg } from 'reactackle-icons';
import defaultProps from './common/defaultProps';

/* eslint-disable max-len */
export const IconTrash = props => (
  <IconSvg {...props}>
    <svg viewBox="0 0 24 24">
      <path d="M6,19c0,1.1,0.9,2,2,2h8c1.1,0,2-0.9,2-2V7H6V19z M19,4h-3l-1-1H9L8,4H5v2h14V4z" />
    </svg>
  </IconSvg>
);
/* eslint-enable max-len */

IconTrash.propTypes = IconSvg.propTypes;
IconTrash.defaultProps = defaultProps;
IconTrash.displayName = 'IconTrash';
