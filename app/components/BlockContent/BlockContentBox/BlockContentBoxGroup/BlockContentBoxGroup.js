/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

const propTypes = {
  dim: PropTypes.bool,
};

const defaultProps = {
  dim: false,
};

export const BlockContentBoxGroup = props => {
  let className = 'block-content_item-group';
  if (props.dim) className += ' color-scheme-dim';
  
  return (
    <div className={className}>
      {props.children}
    </div>
  );
};

BlockContentBoxGroup.propTypes = propTypes;
BlockContentBoxGroup.defaultProps = defaultProps;
BlockContentBoxGroup.displayName = 'BlockContentBoxGroup';
