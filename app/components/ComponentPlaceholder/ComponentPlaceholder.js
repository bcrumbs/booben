'use strict';

import './ComponentPlaceholder.scss';

// noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

export const ComponentPlaceholder = props => {
  let className = 'component-placeholder';
  className += props.isPlaced ? ' is-placed' : ' is-free';

  let content = false;
  if (props.title) {
    content =
          (<div className="component-placeholder-title">
            {props.title}
          </div>);
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
};

ComponentPlaceholder.propTypes = {
  title: PropTypes.string,
  isPlaced: PropTypes.bool,
};

ComponentPlaceholder.defaultProps = {
  title: '',
  isPlaced: false,
};

ComponentPlaceholder.displayName = 'ComponentPlaceholder';
