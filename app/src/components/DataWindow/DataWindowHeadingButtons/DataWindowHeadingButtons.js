/**
 * @author Dmitriy Bizyaev
 */

import React from 'react';
import { HeadingButtonsStyled } from './styles/HeadingButtonsStyled';

export const DataWindowHeadingButtons = props => (
  <HeadingButtonsStyled>
    {props.children}
  </HeadingButtonsStyled>
);

DataWindowHeadingButtons.displayName = 'DataWindowHeadingButtons';
