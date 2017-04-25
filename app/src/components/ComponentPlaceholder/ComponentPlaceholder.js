'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../utils/misc';
import './ComponentPlaceholder.scss';

const propTypes = {
  title: PropTypes.string,
  isPlaced: PropTypes.bool,
  isInvisible: PropTypes.bool,
  elementRef: PropTypes.func,
};

const defaultProps = {
  title: '',
  isPlaced: false,
  isInvisible: false,
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
  
  const style = {};
  if (props.isInvisible) style.opacity = '0';

  return (
    <div
      className={className}
      style={style}
      ref={props.elementRef}
    >
      {content}
    </div>
  );
};

ComponentPlaceholder.propTypes = propTypes;
ComponentPlaceholder.defaultProps = defaultProps;
ComponentPlaceholder.displayName = 'ComponentPlaceholder';
