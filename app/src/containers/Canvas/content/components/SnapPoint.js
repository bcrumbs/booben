/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  containerId: PropTypes.number.isRequired,
  afterIdx: PropTypes.number.isRequired,
};

const defaultProps = {
};

export const SnapPoint = props => (
  <div
    data-jssy-snap-point=""
    data-jssy-snap-point-container-id={props.containerId}
    data-jssy-snap-point-after={props.afterIdx}
  />
);

SnapPoint.propTypes = propTypes;
SnapPoint.defaultProps = defaultProps;
SnapPoint.displayName = 'SnapPoint';
