/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  colorScheme: PropTypes.oneOf(['default', 'editing', 'dim']),
};

const defaultProps = {
  colorScheme: 'default',
};

export const BlockContentBoxGroup = props => {
  let className = 'block-content_item-group';
  
  if (props.colorScheme !== 'default')
    className += ` color-scheme-${props.colorScheme}`;
  
  return (
    <div className={className}>
      {props.children}
    </div>
  );
};

BlockContentBoxGroup.propTypes = propTypes;
BlockContentBoxGroup.defaultProps = defaultProps;
BlockContentBoxGroup.displayName = 'BlockContentBoxGroup';
