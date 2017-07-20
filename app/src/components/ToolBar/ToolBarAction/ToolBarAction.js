'use strict';

import React from 'react';
import { Button, Theme } from '@reactackle/reactackle';
import { ToolBarActionStyled } from './styles/ToolBarActionStyled';
import reactackleThemeMixin from './styles/reactackle-theme-mixin';

const propTypes = {
  ...Button.propTypes,
};

const defaultProps = {
  ...Button.defaultProps,
};

export const ToolBarAction = props => (
  <ToolBarActionStyled>
    <Theme mixin={reactackleThemeMixin}>
      <Button {...props} radius="none" colorScheme="flatLight" />
    </Theme>
  </ToolBarActionStyled>
);

ToolBarAction.propTypes = propTypes;
ToolBarAction.defaultProps = defaultProps;
ToolBarAction.displayName = 'ToolBarAction';
