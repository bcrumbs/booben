'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Button, TooltipIcon } from '@reactackle/reactackle';
import './ComponentHandler.scss';
   
const propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  active: PropTypes.bool,
  expanded: PropTypes.bool,
};

const defaultProps = {
  title: '',
  description: '',
  active: false,
  expanded: false,
};

export const ComponentHandler = props => {
  let className = 'component-handler';
  if (props.active) className += ' is-active';
  if (props.expanded) className += ' is-expanded';
  
  let content = null;
  if (props.expanded && props.children) {
    content = (
      <div className="component-handler_body">
        {props.children}
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="component-handler_heading">
        <div className="component-handler_title">
          <span className="component-handler_title-text">
            {props.title}
          </span>
          
          <TooltipIcon text={props.description} />
        </div>
        
        <div className="component-handler_buttons">
          <Button icon="chevron-down" rounded />
        </div>
      </div>
      
      {content}
    </div>
  );
};

ComponentHandler.propTypes = propTypes;
ComponentHandler.defaultProps = defaultProps;
ComponentHandler.displayName = 'ComponentHandler';
