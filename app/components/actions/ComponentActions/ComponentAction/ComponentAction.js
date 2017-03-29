'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { Button, Icon, TooltipIcon } from '@reactackle/reactackle';
import { noop } from '../../../../utils/misc';
import './ComponentAction.scss';
   
const propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  onEdit: PropTypes.func,
};

const defaultProps = {
  title: '',
  description: '',
  onEdit: noop,
};

export class ComponentAction extends PureComponent {
  constructor(props) {
    super(props);
    
    this._handleClick = this._handleClick.bind(this);
  }
  
  _handleClick() {
    const { id, onEdit } = this.props;
    onEdit({ actionId: id });
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
            <Button icon="times" rounded />
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
