'use strict';

// TODO: Style line

import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../../utils/misc';

const propTypes = {
  createElementRef: PropTypes.func,
};

const defaultProps = {
  createElementRef: noop,
};

export const ComponentsTreeLine = ({ createElementRef }) => (
  <div
    ref={createElementRef}
    className="components-tree-item"
    style={{ height: '4px', marginBottom: '-8px' }}
  >
    <div
      className="components-tree-item-content"
      style={{ height: 'inherit' }}
    >
      <div
        className="components-tree-item-title-wrapper"
        style={{ backgroundColor: 'red', height: 'inherit', width: '100%' }}
      />
    </div>
  </div>
);

ComponentsTreeLine.propTypes = propTypes;
ComponentsTreeLine.defaultProps = defaultProps;
ComponentsTreeLine.displayName = 'ComponentsTreeLine';
