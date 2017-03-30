'use strict';

import React, { PropTypes } from 'react';
import { TooltipIcon } from '@reactackle/reactackle';

import './SourceGroupItem.scss';

const propTypes = {
  title: PropTypes.string,
  type: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool,
};

const defaultProps = {
  title: '',
  type: '',
  description: '',
  disabled: false,
};

export const SourceGroupItem = props => (
  <li className={`source-item${props.disabled ? ' is-disabled' : ''}`}>
    <span className="source-item_title">
      {props.title}
    </span>
  
    <span className="source-item_type">
      ({props.type})
    </span>
    
    <TooltipIcon text={props.description} />
  </li>
);

SourceGroupItem.displayName = 'SourceGroupItem';
SourceGroupItem.propTypes = propTypes;
SourceGroupItem.defaultProps = defaultProps;
