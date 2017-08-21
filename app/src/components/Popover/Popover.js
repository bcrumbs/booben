import React from 'react';
import PropTypes from 'prop-types';
import { PopoverStyled } from './styles/PopoverStyled';
import { TitleStyled } from './styles/TitleStyled';
import { ContentStyled } from './styles/ContentStyled';

const propTypes = {
  title: PropTypes.string,
};

const defaultProps = {
  title: '',
};

export const Popover = ({ children, title }) => (
  <PopoverStyled>
    {title && <TitleStyled>{title}</TitleStyled>}
    <ContentStyled>{children}</ContentStyled>
  </PopoverStyled>
);

Popover.displayName = 'Popover';
Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
