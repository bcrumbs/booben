'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import './BlockContent.scss';

const propTypes = {
  isEmpty: PropTypes.bool,
};

const defaultProps = {
  isEmpty: false,
};

export const BlockContent = props => {
  let className = 'block-content';
  if (props.isEmpty) className += ' is-empty';

  return (
    <div className={className}>
      {props.children}
    </div>
  );
};

BlockContent.propTypes = propTypes;
BlockContent.defaultProps = defaultProps;
BlockContent.displayName = 'BlockContent';

export * from './BlockContentHeading/BlockContentHeading';
export * from './BlockContentTitle/BlockContentTitle';
export * from './BlockContentBox/BlockContentBox';
export * from './BlockContentNavigation/BlockContentNavigation';
export * from './BlockContentActions/BlockContentActions';
export * from './BlockContentShortcut/BlockContentShortcut';
export * from './BlockContentPlaceholder/BlockContentPlaceholder';
export * from './BlockBreadcrumbs/BlockBreadcrumbs';
