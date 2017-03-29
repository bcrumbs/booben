'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { Button, TooltipIcon } from '@reactackle/reactackle';
import { noop } from '../../../../utils/misc';
import './ComponentHandler.scss';
   
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
  constructor(props) {
    super(props);
    
    this._handleExpandButtonPress = this._handleExpandButtonPress.bind(this);
  }
  
  _handleExpandButtonPress() {
    const { id, onExpand } = this.props;
    onExpand({ handlerId: id });
  }
  
  render() {
    const { title, description, hasActions, expanded, children } = this.props;
    
    let className = 'component-handler';
    if (hasActions) className += ' is-active';
    if (expanded) className += ' is-expanded';
  
    let content = null;
    if (expanded && children) {
      content = (
        <div className="component-handler_body">
          {children}
        </div>
      );
    }
  
    let tooltip = null;
    if (description) {
      tooltip = (
        <TooltipIcon text={description} />
      );
    }
  
    return (
      <div className={className}>
        <div className="component-handler_heading">
          <div className="component-handler_title">
            <span className="component-handler_title-text">
              {title}
            </span>
          
            {tooltip}
          </div>
        
          <div className="component-handler_buttons">
            <Button
              icon="chevron-down"
              rounded
              onPress={this._handleExpandButtonPress}
            />
          </div>
        </div>
      
        {content}
      </div>
    );
  }
}

ComponentHandler.propTypes = propTypes;
ComponentHandler.defaultProps = defaultProps;
ComponentHandler.displayName = 'ComponentHandler';
