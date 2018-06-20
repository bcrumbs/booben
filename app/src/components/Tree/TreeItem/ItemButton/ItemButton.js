import React from 'react';
import { Button } from 'reactackle-button';
import { Theme } from 'reactackle-core';
import reactackleThemeMixin from './styles/reactackle-theme-mixin';

const propTypes = {
  ...Button.propTypes,
};

const defaultProps = {
  ...Button.defaultProps,
};

export const ItemButton = props => (
  <Theme mixin={reactackleThemeMixin}>
    <Button
      {...props}
      size="inline"
      radius="rounded"
      colorScheme="flatLight"
    />
  </Theme>
);

ItemButton.propTypes = propTypes;
ItemButton.defaultProps = defaultProps;
ItemButton.displayName = 'ItemButton';
