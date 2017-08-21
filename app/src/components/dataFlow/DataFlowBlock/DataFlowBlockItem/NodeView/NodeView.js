import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '@reactackle/reactackle';
import { Node } from '../../Node/Node';
import { NodeViewStyled } from './styles/NodeViewStyled';
import { ItemContentStyled } from './styles/ItemContentStyled';
import { TitleStyled } from './styles/TitleStyled';
import { SubtitleStyled } from './styles/SubtitleStyled';
import { ErrorMarkStyled } from './styles/ErrorMarkStyled';
import { ButtonStyled } from './styles/ButtonStyled';
import { TitleBoxStyled } from './styles/TitleBoxStyled';

const propTypes = {
  inputType: PropTypes.oneOf([
    'none',
    'complex',
    'default',
    'string',
    'bool',
    'number',
    'shape',
    'array',
  ]),
  removable: PropTypes.bool,
  collapsed: PropTypes.bool,
  error: PropTypes.bool,
  disconnected: PropTypes.bool,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

const defaultProps = {
  inputType: 'default',
  removable: false,
  collapsed: false,
  error: false,
  disconnected: false,
  title: '',
  subtitle: '',
};

export const NodeView = props => {
  const subtitle = props.subtitle && (
    <SubtitleStyled>{props.subtitle}</SubtitleStyled>
  );

  const node = props.inputType !== 'none' && (
    <Node
      disconnected={props.disconnected}
      error={props.error}
      colorScheme={props.inputType}
      position="left"
    />
  );

  const removeButton = props.removable && (
    <ButtonStyled>
      <Button
        icon={{ name: 'times' }}
        size="small"
        radius="rounded"
      />
    </ButtonStyled>
  );

  const collapseButton = props.children && (
    <ButtonStyled collapsed={props.collapsed}>
      <Button
        icon={{ name: 'chevron-down' }}
        size="small"
        radius="rounded"
      />
    </ButtonStyled>
  );

  const errorMark = props.error && (
    <ErrorMarkStyled>
      <Icon size="inherit" color="inherit" name="exclamation" />
    </ErrorMarkStyled>
  );

  return (
    <NodeViewStyled>
      {node}
      <ItemContentStyled>
        <TitleBoxStyled>
          <TitleStyled>{props.title}</TitleStyled>
          {subtitle}
        </TitleBoxStyled>
        {errorMark}
        {removeButton}
        {collapseButton}
      </ItemContentStyled>

      {!props.collapsed && props.children}

    </NodeViewStyled>
  );
};

NodeView.displayName = 'NodeView';
NodeView.propTypes = propTypes;
NodeView.defaultProps = defaultProps;

export * from './NodeGroup/NodeGroup';
