import React from 'react';
import PropTypes from 'prop-types';

import {
  BlockContentNavigationStyled,
} from './styles/BlockContentNavigationStyled';

const propTypes = {
  isBordered: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  isBordered: true,
  colorScheme: 'default',
};

export const BlockContentNavigation = props => (
  <BlockContentNavigationStyled
    bordered={props.isBordered}
    colorScheme={props.colorScheme}
  >
    {props.children}
  </BlockContentNavigationStyled>
);

BlockContentNavigation.propTypes = propTypes;
BlockContentNavigation.defaultProps = defaultProps;
BlockContentNavigation.displayName = 'BlockContentNavigation';
