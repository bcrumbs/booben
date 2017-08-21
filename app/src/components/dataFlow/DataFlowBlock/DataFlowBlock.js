import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@reactackle/reactackle';
import { Action } from './Action/Action';
import { Node } from './Node/Node';
import { BlockStyled } from './styles/BlockStyled';
import { HeaderBoxStyled } from './styles/HeaderBoxStyled';
import { TitleStyled } from './styles/TitleStyled';
import { SubtitleStyled } from './styles/SubtitleStyled';
import { SubtitleTextStyled } from './styles/SubtitleTextStyled';
import { ContentBoxStyled } from './styles/ContentBoxStyled';
import { ActionsStyled } from './styles/ActionsStyled';
import { DescriptionMarkStyled } from './styles/DescriptionMarkStyled';

const propTypes = {
  title: PropTypes.string,
  outputType: PropTypes.oneOf([
    'default',
    'string',
    'bool',
    'number',
    'shape',
    'array',
  ]),
  typeDescription: PropTypes.string,
  actions: PropTypes.arrayOf(Action),
  endPoint: PropTypes.bool,
  disconnected: PropTypes.bool,
};

const defaultProps = {
  title: '',
  outputType: '',
  typeDescription: '',
  actions: [],
  endPoint: false,
  disconnected: false,
};

export const DataFlowBlock = props => {
  const descriptionMark = props.typeDescription && (
    <DescriptionMarkStyled>
      <Icon name='arrow-circle-o-right' size="inherit" color="inherit" />
    </DescriptionMarkStyled>
  );

  const subtitle = props.outputType !== 'default'
    ? `output type: ${props.outputType}`
    : 'Please, connect with some node';

  const actions = props.actions.map((item, idx) => (
    <Action {...item} key={idx} />
  ));

  const actionsWrapper = props.actions
    ? <ActionsStyled>{actions}</ActionsStyled>
    : null;

  return(
    <BlockStyled disconnected={props.disconnected}>

      <HeaderBoxStyled colorScheme={props.outputType}>
        <TitleStyled>
          {props.title}
        </TitleStyled>
        <SubtitleStyled>
          <SubtitleTextStyled>
            {subtitle}
          </SubtitleTextStyled>
          {descriptionMark}
        </SubtitleStyled>
        <Node
          colorScheme={props.outputType}
          position={props.endPoint ? "left" : "right"}
        />
      </HeaderBoxStyled>

      <ContentBoxStyled>
        {props.children}
      </ContentBoxStyled>

      {actionsWrapper}

    </BlockStyled>
  );
};

DataFlowBlock.displayName = 'DataFlowBlock';
DataFlowBlock.propTypes = propTypes;
DataFlowBlock.defaultProps = defaultProps;

export * from './DataFlowBlockHeading/DataFlowBlockHeading';
export * from './DataFlowBlockItem/DataFlowBlockItem';
