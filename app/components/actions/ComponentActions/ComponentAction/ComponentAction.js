'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, TooltipIcon } from '@reactackle/reactackle';
import { noop } from '../../../../utils/misc';
import './ComponentAction.scss';
   
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
    this._handleDeleteButtonClick = this._handleDeleteButtonClick.bind(this);
  }
  
  _handleClick() {
    const { id, onEdit } = this.props;
    onEdit({ actionId: id });
  }
  
  _handleDeleteButtonClick() {
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
        <div className="component-action_body">
          {children}
        </div>
      );
    }
  
    return (
      <div className="component-action">
        <div className="component-action_heading">
          <a
            className="component-action_link-wrapper"
            onClick={this._handleClick}
          >
            <div className="component-action_icon">
              <Icon name="long-arrow-right" />
            </div>
            
            <div className="component-action_title">
              <span className="component-action_title-text">
                {title}
              </span>
              
              {tooltip}
            </div>
          </a>
          
          <div className="component-action_buttons">
            <Button
              icon="times"
              rounded
              onPress={this._handleDeleteButtonClick}
            />
          </div>
        </div>
        
        {content}
      </div>
    );
  }
}

ComponentAction.propTypes = propTypes;
ComponentAction.defaultProps = defaultProps;
ComponentAction.displayName = 'ComponentAction';

export * from './ComponentActionCaseRow/ComponentActionCaseRow';
