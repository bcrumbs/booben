import React from 'react';
import PropTypes from 'prop-types';
import { ShortcutItemStyled } from './styles/ShortcutItemStyled';
import { KeyStyled } from './styles/KeyStyled';
import { DescriptionStyled } from './styles/DescriptionStyled';

const propTypes = {
  shortcut: PropTypes.string,
  description: PropTypes.string,
};

const defaultProps = {
  shortcut: '',
  description: '',
};

export const ShortcutItem = ({ shortcut, description }) => (
  <ShortcutItemStyled>
    <KeyStyled>{shortcut}</KeyStyled>
    <DescriptionStyled>{description}</DescriptionStyled>
  </ShortcutItemStyled>
);

ShortcutItem.propTypes = propTypes;
ShortcutItem.defaultProps = defaultProps;
ShortcutItem.displayName = 'ShortcutItem';
