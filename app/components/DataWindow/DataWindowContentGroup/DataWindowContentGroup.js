'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

const propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

const defaultProps = {
  title: '',
  subtitle: '',
};

export const DataWindowContentGroup = props => (
  <div className="data-window_content-group">
    <div className="data-window_content-group_title">
      {props.title}
    </div>
    <div className="data-window_content-group_subtitle">
      {props.subtitle}
    </div>
    <div className="data-window_content-group_content">
      {props.children}
    </div>
  </div>
);

DataWindowContentGroup.propTypes = propTypes;
DataWindowContentGroup.defaultProps = defaultProps;
DataWindowContentGroup.displayName = 'DataWindowContentGroup';
