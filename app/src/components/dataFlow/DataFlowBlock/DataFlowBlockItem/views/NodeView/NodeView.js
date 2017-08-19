import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@reactackle/reactackle';
import { Node } from '../../../Node/Node';
import { ItemContentStyled } from './styles/ItemContentStyled';
import { TitleStyled } from './styles/TitleStyled';
import { SubtitleStyled } from './styles/SubtitleStyled';
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
    'object',
    'array',
  ]),
  removable: PropTypes.bool,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

const defaultProps = {
  inputType: 'default',
  removable: false,
};

export const NodeView = props => {
  const subtitle = props.subtitle && (
    <SubtitleStyled>{props.subtitle}</SubtitleStyled>
  );

  const node = props.inputType !== 'none' && (
    <Node colorScheme={props.inputType} position="left" />
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
    <ButtonStyled>
      <Button
        icon={{ name: 'chevron-down' }}
        size="small"
        radius="rounded"
      />
    </ButtonStyled>
  );

  return (
    <div>
      {node}
      <ItemContentStyled>
        <TitleBoxStyled>
          <TitleStyled>{props.title}</TitleStyled>
          {subtitle}
        </TitleBoxStyled>
        {removeButton}
        {collapseButton}
      </ItemContentStyled>
      {props.children}
    </div>
  );
};

NodeView.displayName = 'NodeView';
NodeView.propTypes = propTypes;
NodeView.defaultProps = defaultProps;
