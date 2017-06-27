/**
 * @author Ekaterina Marova
 */

'use strict';

import React from 'react';
import { GroupTitleStyled } from './styles/GroupTitleStyled';

export const OptionsGroupTitle = ({ children }) => (
  <GroupTitleStyled>{children}</GroupTitleStyled>
);

OptionsGroupTitle.displayName = 'OptionsGroupTitle';
