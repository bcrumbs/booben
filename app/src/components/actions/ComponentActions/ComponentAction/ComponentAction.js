'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, TooltipIcon } from '@reactackle/reactackle';
import { noop } from '../../../../utils/misc';
import { ActionHeadingStyled } from './styles/ActionHeadingStyled';
import { ActionLinkWrapperStyled } from './styles/ActionLinkWrapperStyled';
import { ActionTitleStyled } from './styles/ActionTitleStyled';
import { ActionTitleTextStyled } from './styles/ActionTitleTextStyled';
import { ActionIconStyled } from './styles/ActionIconStyled';

import {
  ActionButtonsWrapperStyled,
} from './styles/ActionButtonsWrapperStyled';

import {
  ActionContentWrapperStyled,
} from './styles/ActionContentWrapperStyled';
   
const propTypes = {
  id: PropTypes.any.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

const defaultProps = {
  title: '',
  description: '',
  onEdit: noop,
  onDelete: noop,
};

export class ComponentAction extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this._handleClick = this._handleClick.bind(this);
    this._handleDeleteButtonPress = this._handleDeleteButtonPress.bind(this);
  }
  
  _handleClick(event) {
    const { id, onEdit } = this.props;

    if (event.button === 0) {
      onEdit({ actionId: id });
    }
  }
  
  _handleDeleteButtonPress() {
    const { id, onDelete } = this.props;
    onDelete({ actionId: id });
  }
  
  render() {
    const { title, description, children } = this.props;
    
    let tooltip = null;
    if (description) {
      tooltip = (
        <TooltipIcon text={description} />
      );
    }
  
    let content = null;
    if (children) {
      content = (
        <ActionContentWrapperStyled>
          {children}
        </ActionContentWrapperStyled>
      );
    }
  
    return (
      <div>
        <ActionHeadingStyled>
          <ActionLinkWrapperStyled onClick={this._handleClick}>
            <ActionIconStyled>
              <Icon name="long-arrow-right" size="inherit" color="inherit" />
            </ActionIconStyled>
            
            <ActionTitleStyled>
              <ActionTitleTextStyled>
                {title}
              </ActionTitleTextStyled>
              
              {tooltip}
            </ActionTitleStyled>
          </ActionLinkWrapperStyled>
          
          <ActionButtonsWrapperStyled>
            <Button
              icon={{ name: 'times' }}
              radius="rounded"
              size="small"
              colorScheme="flatLight"
              onPress={this._handleDeleteButtonPress}
            />
          </ActionButtonsWrapperStyled>
        </ActionHeadingStyled>
        
        {content}
      </div>
    );
  }
}

ComponentAction.propTypes = propTypes;
ComponentAction.defaultProps = defaultProps;
ComponentAction.displayName = 'ComponentAction';

export * from './ComponentActionCaseRow/ComponentActionCaseRow';
