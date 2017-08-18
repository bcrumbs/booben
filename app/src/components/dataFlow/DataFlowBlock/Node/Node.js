import React from 'react';
import PropTypes from 'prop-types';
import { NodeStyled } from './styles/NodeStyled';

const propTypes = {
};

const defaultProps = {
};

export const Node = props => (
  <NodeStyled />
);

Node.displayName = 'Node';
Node.propTypes = propTypes;
Node.defaultProps = defaultProps;
