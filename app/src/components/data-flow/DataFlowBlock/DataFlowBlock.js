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
import resizeable from '../../../hocs/resizeable';
import movable from '../../../hocs/movable';

const propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
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
  rootRef: PropTypes.func.isRequired, // movable
  pickRef: PropTypes.func.isRequired, // movable
  initialRootStyle: PropTypes.object.isRequired, // movable
};

const defaultProps = {
  title: '',
  subtitle: '',
  outputType: '',
  typeDescription: '',
  actions: [],
  endPoint: false,
  disconnected: false,
};

const _DataFlowBlock = ({
  title,
  subtitle,
  outputType,
  typeDescription,
  actions,
  endPoint,
  disconnected,
  rootRef,
  pickRef,
  initialRootStyle,
  children,
}) => {
  let descriptionMark = null;
  if (typeDescription) {
    descriptionMark = (
      <DescriptionMarkStyled>
        <Icon name="arrow-circle-o-right" size="inherit" color="inherit" />
      </DescriptionMarkStyled>
    );
  }
  
  const actionElements = actions.map((item, idx) => (
    <Action {...item} key={String(idx)} />
  ));
  
  const actionsWrapper = actions.length > 0
    ? <ActionsStyled>{actionElements}</ActionsStyled>
    : null;
  
  return (
    <BlockStyled
      style={initialRootStyle}
      disconnected={disconnected}
      innerRef={rootRef}
    >
      <HeaderBoxStyled
        colorScheme={outputType}
        innerRef={pickRef}
      >
        <TitleStyled>
          {title}
        </TitleStyled>
        
        <SubtitleStyled>
          <SubtitleTextStyled>
            {subtitle}
          </SubtitleTextStyled>
          {descriptionMark}
        </SubtitleStyled>
        
        <Node
          colorScheme={outputType}
          position={endPoint ? 'left' : 'right'}
        />
      </HeaderBoxStyled>
      
      <ContentBoxStyled>
        {children}
      </ContentBoxStyled>
      
      {actionsWrapper}
    </BlockStyled>
  );
};

_DataFlowBlock.displayName = 'DataFlowBlock';
_DataFlowBlock.propTypes = propTypes;
_DataFlowBlock.defaultProps = defaultProps;

export const DataFlowBlock = resizeable(movable(_DataFlowBlock));

export * from './DataFlowBlockHeading/DataFlowBlockHeading';
export * from './DataFlowBlockItem/DataFlowBlockItem';
