/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PropTypes } from 'react';

const propTypes = {
  type: PropTypes.oneOf(['success', 'error']),
  title: PropTypes.string,
};

const defaultProps = {
  type: 'success',
  title: '',
};

export const ComponentActionCaseRow = ({ type, title, children }) => (
  <div className={`component-case case-type-${type}`}>
    <div className="component-case_header">
      <div className="component-case_marker" />
      
      <div className="component-case_title">
        {title}
      </div>
    </div>
    
    <div className="component-case_body">
      {children}
    </div>
  </div>
);

ComponentActionCaseRow.propTypes = propTypes;
ComponentActionCaseRow.defaultProps = defaultProps;
ComponentActionCaseRow.displayName = 'ComponentActionCaseRow';
