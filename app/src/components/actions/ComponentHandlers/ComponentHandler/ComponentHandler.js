'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Icon, TooltipIcon } from '@reactackle/reactackle';
import { noop } from '../../../../utils/misc';
import { HandlerStyled } from './styles/HandlerStyled';
import { HandlerHeadingStyled } from './styles/HandlerHeadingStyled';
import { HandlerTitleStyled } from './styles/HandlerTitleStyled';
import { HandlerTitleTextStyled } from './styles/HandlerTitleTextStyled';
import { HandlerIconStyled } from './styles/HandlerIconStyled';
import { HandlerBodyStyled } from './styles/HandlerBodyStyled';
   
const propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  hasActions: PropTypes.bool,
  expanded: PropTypes.bool,
  onExpand: PropTypes.func,
};

const defaultProps = {
  title: '',
  description: '',
  hasActions: false,
  expanded: false,
  onExpand: noop,
};

export class ComponentHandler extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this._handleExpandButtonPress = this._handleExpandButtonPress.bind(this);
  }
  
  _handleExpandButtonPress() {
    const { id, onExpand } = this.props;
    onExpand({ handlerId: id });
  }
  
  render() {
    const { title, description, hasActions, expanded, children } = this.props;
  
    let content = null;
    if (expanded && children) {
      content = (
        <HandlerBodyStyled>
          {children}
        </HandlerBodyStyled>
      );
    }
  
    let tooltip = null;
    if (description) {
      tooltip = (
        <TooltipIcon text={description} />
      );
    }
  
    return (
      <HandlerStyled onPress={this._handleExpandButtonPress}>
        <HandlerHeadingStyled>
          <HandlerTitleStyled active={hasActions}>
            <HandlerTitleTextStyled>
              {title}
            </HandlerTitleTextStyled>
          
            {tooltip}
          </HandlerTitleStyled>
        
          <HandlerIconStyled expanded={expanded}>
            <Icon name="chevron-down" size="small" />
          </HandlerIconStyled>
        </HandlerHeadingStyled>
      
        {content}
      </HandlerStyled>
    );
  }
}

ComponentHandler.propTypes = propTypes;
ComponentHandler.defaultProps = defaultProps;
ComponentHandler.displayName = 'ComponentHandler';
