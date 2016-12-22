'use strict';

// noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

const propTypes = {
  isBordered: PropTypes.bool,
  blank: PropTypes.bool,
  flexMain: PropTypes.bool, // If true, flex-grow will be st to '1' for this block
};

const defaultProps = {
  isBordered: false,
  blank: false,
  flexMain: false,
};

export const BlockContentBoxItem = props => {
  let className = 'block-content-box-item';
  if (props.isBordered) className += ' is-bordered';
  if (props.blank) className += ' is-blank';
  if (props.flexMain) className += ' flex-main';

  return (
    <div className={className}>
      {props.children}
    </div>
  );
};

BlockContentBoxItem.propTypes = propTypes;
BlockContentBoxItem.defaultProps = defaultProps;
BlockContentBoxItem.displayName = 'BlockContentBoxItem';
