'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import {
  ComponentPlaceholder,
} from '../../ComponentPlaceholder/ComponentPlaceholder';

const propTypes = {
  text: PropTypes.string,
  separator: PropTypes.bool,
  placeholder: PropTypes.bool,
  visible: PropTypes.bool,
  disabled: PropTypes.bool,
  focus: PropTypes.bool,
};

const defaultProps = {
  text: '',
  separator: false,
  placeholder: false,
  visible: false,
  disabled: false,
  focus: false,
};

export const ComponentBreadcrumbItem = props => {
  let className = 'component-breadcrumb-item';
  if (props.focus) className += ' is-focused';
  if (props.disabled) className += ' is-disabled';
  if (props.placeholder) className += ' component-breadcrumbs-placeholder';
  if (props.visible && props.placeholder) className += ' is-visible';

  let content = null;
  if (props.separator) {
    className += ' component-breadcrumbs-separator';
    content = (
      <div className="component-breadcrumb-item-text">
        &gt;
      </div>
    );
  } else if (props.text) {
    content = (
      <div className="component-breadcrumb-item-text">
        {props.text}
      </div>
    );
  } else if (props.placeholder) {
    content = (
      <div className="component-breadcrumb-placeholder">
        <ComponentPlaceholder isPlaced />
      </div>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
};

ComponentBreadcrumbItem.propTypes = propTypes;
ComponentBreadcrumbItem.defaultProps = defaultProps;
ComponentBreadcrumbItem.displayName = 'ComponentBreadcrumbItem';
