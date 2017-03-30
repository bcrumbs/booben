'use strict';

import React, { PropTypes } from 'react';
import './SourceDivider.scss';

const propTypes = {
  title: PropTypes.string,
};

const defaultProps = {
  title: '',
};

export const SourceDivider = props => (
  <div className="source-divider">
    {props.title}
  </div>
);

SourceDivider.displayName = 'SourceDivider';
SourceDivider.propTypes = propTypes;
SourceDivider.defaultProps = defaultProps;

