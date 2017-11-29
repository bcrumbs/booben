import React from 'react';
import PropTypes from 'prop-types';
import { BlockContentActionsStyled } from './styles/BlockContentActionsStyled';

const propTypes = {
  isBordered: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  isBordered: false,
  colorScheme: 'default',
};

export const BlockContentActions = props => (
  <BlockContentActionsStyled
    bordered={props.isBordered}
    colorScheme={props.colorScheme}
  >
    {props.children}
  </BlockContentActionsStyled>
);

BlockContentActions.propTypes = propTypes;
BlockContentActions.defaultProps = defaultProps;
BlockContentActions.displayName = 'BlockContentActions';

export * from './BlockContentActionsRegion/BlockContentActionsRegion';
