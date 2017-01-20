/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

const propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  type: PropTypes.string,
};

const defaultProps = {
  subtitle: '',
  type: '',
};

export const DataWindowTitle = props => {
  let type = null;
  if (props.type) {
    type = (
      <div className="data-window_type">
        {props.type}
      </div>
    );
  }
  
  let subtitle = null;
  if (props.subtitle) {
    subtitle = (
      <div className="data-window_subtitle">
        {props.subtitle}
      </div>
    );
  }
  
  return (
    <div className="data-window_title-box">
      <div className="data-window_title-content">
        <div className="data-window_title">
          {props.title}
        </div>
        {type}
        {subtitle}
      </div>
    </div>
  );
};

DataWindowTitle.propTypes = propTypes;
DataWindowTitle.defaultProps = defaultProps;
DataWindowTitle.displayName = 'DataWindowTitle';
