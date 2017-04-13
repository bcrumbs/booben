'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import './ComponentPlaceholder.scss';

const propTypes = {
  title: PropTypes.string,
  isPlaced: PropTypes.bool,
};

const defaultProps = {
  title: '',
  isPlaced: false,
};

export const ComponentPlaceholder = props => {
  let className = 'component-placeholder';
  className += props.isPlaced ? ' is-placed' : ' is-free';

  let content = false;
  if (props.title) {
    content = (
      <div className="component-placeholder-title">
        {props.title}
      </div>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
};

ComponentPlaceholder.propTypes = propTypes;
ComponentPlaceholder.defaultProps = defaultProps;
ComponentPlaceholder.displayName = 'ComponentPlaceholder';
