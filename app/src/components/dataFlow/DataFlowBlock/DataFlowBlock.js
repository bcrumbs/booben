import React from 'react';
import PropTypes from 'prop-types';
import { Action } from './Action/Action';
import { Node } from './Node/Node';
import { BlockStyled } from './styles/BlockStyled';
import { HeaderBoxStyled } from './styles/HeaderBoxStyled';
import { TitleStyled } from './styles/TitleStyled';
import { SubtitleStyled } from './styles/SubtitleStyled';
import { ContentBoxStyled } from './styles/ContentBoxStyled';

const propTypes = {
  title: PropTypes.string,
  outputType: PropTypes.oneOf([
    'default',
    'string',
    'bool',
    'number',
    'object',
    'array',
  ]),
  actions: PropTypes.arrayOf(Action),
};

const defaultProps = {
  title: '',
  outputType: '',
  actions: [],
};

export const DataFlowBlock = props => {
  const subtitle = props.outputType !== 'default'
    ? `output type: ${props.outputType}`
    : 'Please, connect with some node';

  return(
    <BlockStyled>
      <HeaderBoxStyled colorScheme={props.outputType}>
        <TitleStyled>
          {props.title}
        </TitleStyled>
        <SubtitleStyled>
          {subtitle}
        </SubtitleStyled>
        <Node />
      </HeaderBoxStyled>
      <ContentBoxStyled>
        {props.children}
      </ContentBoxStyled>
    </BlockStyled>
  );
};

DataFlowBlock.displayName = 'DataFlowBlock';
DataFlowBlock.propTypes = propTypes;
DataFlowBlock.defaultProps = defaultProps;

export * from './DataFlowBlockItem/DataFlowBlockItem';
