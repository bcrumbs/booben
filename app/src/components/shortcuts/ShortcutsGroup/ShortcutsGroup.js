import React from 'react';
import PropTypes from 'prop-types';
import { ShortcutsGroupStyled } from './styles/ShortcutsGroupStyled';
import { GroupTitleStyled } from './styles/GroupTitleStyled';
import { ItemsWrapperStyled } from './styles/ItemsWrapperStyled';

const propTypes = {
  title: PropTypes.string,
};

const defaultProps = {
  title: '',
};

export const ShortcutsGroup = ({ children, title }) => (
  <ShortcutsGroupStyled>
    {title && <GroupTitleStyled>{title}</GroupTitleStyled>}

    <ItemsWrapperStyled>
      {children}
    </ItemsWrapperStyled>
  </ShortcutsGroupStyled>
);

ShortcutsGroup.propTypes = propTypes;
ShortcutsGroup.defaultProps = defaultProps;
ShortcutsGroup.displayName = 'ShortcutsGroup';
