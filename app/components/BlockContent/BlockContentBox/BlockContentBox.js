'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { autoScrollUpDown } from '../../../hocs/autoScrollUpDown';
import { noop } from '../../../utils/misc';

const propTypes = {
  isBordered: PropTypes.bool,
  flex: PropTypes.bool,
  onMouseUp: PropTypes.func,
  createElementRef: PropTypes.func,
};

const defaultProps = {
  isBordered: false,
  flex: false,
  onMouseUp: noop,
  createElementRef: noop,
};

const BlockContentBoxComponent = props => {
  let className = 'block-content-box-area';
  if (props.isBordered) className += ' is-bordered';
  if (props.flex) className += ' display-flex';

  return (
    <div
      className={className}
      ref={props.createElementRef}
      onMouseUp={props.onMouseUp}
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
