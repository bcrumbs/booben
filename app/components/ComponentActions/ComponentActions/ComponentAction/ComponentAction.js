'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import {
  Button,
  Icon,
  TooltipIcon,
} from '@reactackle/reactackle';


import './ComponentAction.scss';
   
const propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  onSuccess: PropTypes.any,
  onError: PropTypes.any,
};

const defaultProps = {
  title: '',
  description: '',
};

const CaseRow = ({type, title, children}) => (
  <div className={`component-case case-type-${type}`}>
    <div className='component-case_header'>
      <div className='component-case_marker'>
      </div>
      <div className='component-case_title'>
        {title}
      </div>
    </div>
    <div className='component-case_body'>
      {children}
    </div>
  </div>
);

export const ComponentAction = props => {
  let success = null,
    error = null;
  
  if (props.onSuccess) {
    success =
      <CaseRow type="success" title="on Success">
        {props.onSuccess}
      </CaseRow>;
  }
  
  if (props.onError) {
    error =
      <CaseRow type="error" title="on Error">
        {props.onError}
      </CaseRow>;
  }
  
  return (
    <div className='component-action'>
      <div className="component-action_heading">
        <a className="component-action_link-wrapper">
          <div className="component-action_icon">
            <Icon name="long-arrow-right" />
          </div>
          <div className="component-action_title">
          <span className="component-action_title-text">
            {props.title}
          </span>
            
            { props.description
              ? <TooltipIcon text={props.description} />
              : null
            }
          </div>
        </a>
        
        <div className="component-action_buttons">
          <Button icon="times" rounded />
        </div>
      </div>
      
      { success || error
        ? <div className="component-action_body">
          {success}
          {error}
        </div>
        : null
      }
    </div>
  );
};

ComponentAction.propTypes = propTypes;
ComponentAction.defaultProps = defaultProps;
ComponentAction.displayName = 'ComponentAction';
