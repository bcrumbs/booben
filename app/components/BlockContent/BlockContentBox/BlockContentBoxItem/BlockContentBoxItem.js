'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

const propTypes = {
  isBordered: PropTypes.bool,
  blank: PropTypes.bool,
  // If true, flex-grow will be st to '1' for this block
  flexMain: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['default', 'editing', 'dim'])
};

const defaultProps = {
  isBordered: false,
  blank: false,
  flexMain: false,
  colorScheme: 'default'
};

export const BlockContentBoxItem = props => {
  let className = 'block-content-box-item';
  if (props.isBordered) className += ' is-bordered';
  if (props.blank) className += ' is-blank';
  if (props.flexMain) className += ' flex-main';
  if (props.colorScheme && props.colorScheme != "default") className += ' color-scheme-' + props.colorScheme;

  return (
    <div className={className}>
      {props.children}
    </div>
  );
};

BlockContentBoxItem.propTypes = propTypes;
BlockContentBoxItem.defaultProps = defaultProps;
BlockContentBoxItem.displayName = 'BlockContentBoxItem';
