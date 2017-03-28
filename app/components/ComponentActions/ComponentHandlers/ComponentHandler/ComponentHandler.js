'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import {
  Button,
  TooltipIcon,
} from '@reactackle/reactackle';


import './ComponentHandler.scss';
   
const propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  active: PropTypes.bool,
  content: PropTypes.any,
};

const defaultProps = {
  title: '',
  description: '',
  active: false,
};

export const ComponentHandler = props => {
  let className = 'component-handler';
  if (props.active) className += ' is-active';
  
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
      
      { props.content
        ? <div className="component-handler_body">{props.content}</div>
        : null
      }
    </div>
  );
};

ComponentHandler.propTypes = propTypes;
ComponentHandler.defaultProps = defaultProps;
ComponentHandler.displayName = 'ComponentHandler';
