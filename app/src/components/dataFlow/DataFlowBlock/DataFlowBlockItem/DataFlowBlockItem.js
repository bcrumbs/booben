import React from 'react';
import PropTypes from 'prop-types';
import { Node } from '../Node/Node';
import { ItemStyled } from './styles/ItemStyled';

const propTypes = {};
const defaultProps = {};

export const DataFlowBlockItem = props => (
  <ItemStyled>
    item
    <Node />
  </ItemStyled>
);

DataFlowBlockItem.displayName = 'DataFlowBlockItem';
DataFlowBlockItem.propTypes = propTypes;
DataFlowBlockItem.defaultProps = defaultProps;
