/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

const propTypes = {
  dim: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['default', 'editing', 'dim'])
};

const defaultProps = {
  dim: false,
  colorScheme: 'default'
};

export const BlockContentBoxGroup = props => {
  let className = 'block-content_item-group';
  if (props.dim) className += ' color-scheme-dim';
  if (props.colorScheme && props.colorScheme != "default") className += ' color-scheme-' + props.colorScheme;
  
  return (
    <div className={className}>
      {props.children}
    </div>
  );
};

BlockContentBoxGroup.propTypes = propTypes;
BlockContentBoxGroup.defaultProps = defaultProps;
BlockContentBoxGroup.displayName = 'BlockContentBoxGroup';
