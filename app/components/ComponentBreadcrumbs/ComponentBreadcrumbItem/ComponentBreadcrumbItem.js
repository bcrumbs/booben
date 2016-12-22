import React, { PropTypes } from 'react';

import { ComponentPlaceholder } from '../../ComponentPlaceholder/ComponentPlaceholder';

export const ComponentBreadcrumbItem = props => {
  let className = 'component-breadcrumb-item';

  if (props.focus) className += ' ' + 'is-focused';
  if (props.disabled) className += ' ' + 'is-disabled';
  if (props.placeholder) className += ' ' + 'component-breadcrumbs-placeholder';
  if (props.visible && props.placeholder) className += ' ' + 'is-visible';

  let content = false;
  const textClassName = 'component-breadcrumb-item-text';
  if (props.separator) {
    className += ' ' + 'component-breadcrumbs-separator';
    content = <div className={textClassName}>&gt;</div>;
  } else if (props.text) {
    content = <div className={textClassName}>{ props.text }</div>;
  } else if (props.placeholder) {
    content =
          (<div className="component-breadcrumb-placeholder">
            <ComponentPlaceholder isPlaced />
          </div>);
  }

  return (
    <div className={className}>
      { content }
    </div>
  );
};

ComponentBreadcrumbItem.propTypes = {
  text: PropTypes.string,
  separator: PropTypes.bool,
  placeholder: PropTypes.bool,
  visible: PropTypes.bool,
  disabled: PropTypes.bool,
  focus: PropTypes.bool,
};

ComponentBreadcrumbItem.defaultProps = {
  text: '',
  separator: false,
  placeholder: false,
  visible: false,
  disabled: false,
  focus: false,
};

ComponentBreadcrumbItem.displayName = 'ComponentBreadcrumbItem';
