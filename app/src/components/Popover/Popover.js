import React from 'react';
import PropTypes from 'prop-types';
import { PopoverStyled } from './styles/PopoverStyled';
import { TitleStyled } from './styles/TitleStyled';
import { ContentStyled } from './styles/ContentStyled';

const propTypes = {
  title: PropTypes.string,
  /*
   * Specify Popover position. Arrow will be placed on the opposite side.
   */
  position: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
};

const defaultProps = {
  title: '',
  position: 'right',
};

// TODO Popover should be positioned inside window boundaries
export const Popover = ({ children, title, position }) => (
  <PopoverStyled position={position}>
    {title && <TitleStyled>{title}</TitleStyled>}
    <ContentStyled>{children}</ContentStyled>
  </PopoverStyled>
);

Popover.displayName = 'Popover';
Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
