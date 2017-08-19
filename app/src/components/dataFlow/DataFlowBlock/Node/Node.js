import React from 'react';
import PropTypes from 'prop-types';
import { NodeStyled } from './styles/NodeStyled';
import { ComplexStyled } from './styles/ComplexStyled';

const propTypes = {
  colorScheme: PropTypes.oneOf([
    'complex',
    'default',
    'string',
    'bool',
    'number',
    'object',
    'array',
  ]),
  position: PropTypes.oneOf([
    'left',
    'right',
  ]),
};

const defaultProps = {
  colorScheme: 'default',
  position: 'left',
};

export const Node = props => {
  const complex = props.colorScheme === 'complex' && (
      <ComplexStyled>
        <div />
        <div />
        <div />
        <div />
      </ComplexStyled>
    );

  return (
    <NodeStyled
      colorScheme={props.colorScheme !== 'complex'
        ? props.colorScheme
        : 'default'
      }
      position={props.position}
    >
      {complex}
    </NodeStyled>
  );
};

Node.displayName = 'Node';
Node.propTypes = propTypes;
Node.defaultProps = defaultProps;
