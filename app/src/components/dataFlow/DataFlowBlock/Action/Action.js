import React from 'react';
import { Button } from '@reactackle/reactackle';

const propTypes = {
  ...Button
};

const defaultProps = {
  ...Button
};

export const Action = props => (
  <ActionStyled>
    <Button {...props} />
  </ActionStyled>
);

Action.displayName = 'Action';
Action.propTypes = propTypes;
Action.defaultProps = defaultProps;
