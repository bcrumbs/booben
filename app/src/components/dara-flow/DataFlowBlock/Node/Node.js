import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@reactackle/reactackle';
import { NodeStyled } from './styles/NodeStyled';
import { ComplexStyled } from './styles/ComplexStyled';
import { IconStyled } from './styles/IconStyled';

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
  error: PropTypes.bool,
  disconnected: PropTypes.bool,
};

const defaultProps = {
  colorScheme: 'default',
  position: 'left',
  error: false,
  disconnected: false,
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

  const disconnected = props.disconnected && (
      <IconStyled>
        <Icon
          size="inherit"
          color="inherit"
          name="plus"
        />
      </IconStyled>
    );

  return (
    <NodeStyled
      colorScheme={props.colorScheme !== 'complex'
        ? props.colorScheme
        : 'default'
      }
      position={props.position}
      error={props.error}
      disconnected={props.disconnected}
    >
      {complex}
      {disconnected}
    </NodeStyled>
  );
};

Node.displayName = 'Node';
Node.propTypes = propTypes;
Node.defaultProps = defaultProps;
