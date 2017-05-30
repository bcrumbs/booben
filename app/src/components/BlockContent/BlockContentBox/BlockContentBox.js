'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { autoScrollUpDown } from '../../../hocs/autoScrollUpDown';
import { noop } from '../../../utils/misc';

const propTypes = {
  isBordered: PropTypes.bool,
  flex: PropTypes.bool,
  hidden: PropTypes.bool,
  elementRef: PropTypes.func,
};

const defaultProps = {
  isBordered: false,
  flex: false,
  hidden: false,
  elementRef: noop,
};

const BlockContentBoxComponent = props => {
  let className = 'block-content-box-area';
  if (props.isBordered) className += ' is-bordered';
  if (props.flex) className += ' display-flex';
  
  const style = {};
  if (props.hidden) style.display = 'none';

  return (
    <div
      className={className}
      style={style}
      ref={props.elementRef}
    >
      {props.children}
    </div>
  );
};

BlockContentBoxComponent.propTypes = propTypes;
BlockContentBoxComponent.defaultProps = defaultProps;
BlockContentBoxComponent.displayName = 'BlockContentBox';

export const BlockContentBox = autoScrollUpDown(BlockContentBoxComponent);
export * from './BlockContentBoxItem/BlockContentBoxItem';
export * from './BlockContentBoxHeading/BlockContentBoxHeading';
export * from './BlockContentBoxGroup/BlockContentBoxGroup';
