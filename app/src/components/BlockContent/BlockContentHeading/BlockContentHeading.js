import React from 'react';
import PropTypes from 'prop-types';
import { BlockContentHeadingStyled } from './styles/BlockContentHeadingStyled';

const propTypes = {
  isBordered: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  isBordered: false,
  colorScheme: 'default',
};

export const BlockContentHeading = props => (
  <BlockContentHeadingStyled
    bordered={props.isBordered}
    colorScheme={props.colorScheme}
  >
    {props.children}
  </BlockContentHeadingStyled>
);

BlockContentHeading.propTypes = propTypes;
BlockContentHeading.defaultProps = defaultProps;
BlockContentHeading.displayName = 'BlockContentHeading';
