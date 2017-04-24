'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../utils/misc';
import './ComponentPlaceholder.scss';

const propTypes = {
  title: PropTypes.string,
  isPlaced: PropTypes.bool,
  elementRef: PropTypes.func,
};

const defaultProps = {
  title: '',
  isPlaced: false,
  elementRef: noop,
};

export const ComponentPlaceholder = props => {
  let className = 'component-placeholder';
  className += props.isPlaced ? ' is-placed' : ' is-free';

  let content = false;
  if (props.title) {
    const titleClassName =
      'component-placeholder-title ' +
      'js-component-placeholder-title';

    content = (
      <div className={titleClassName}>
        {props.title}
      </div>
    );
  }

  return (
    <div
      className={className}
      ref={props.elementRef}
    >
      {content}
    </div>
  );
};

ComponentPlaceholder.propTypes = propTypes;
ComponentPlaceholder.defaultProps = defaultProps;
ComponentPlaceholder.displayName = 'ComponentPlaceholder';
