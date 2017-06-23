/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ProjectComponent from '../models/ProjectComponent';
import ProjectRoute from '../models/ProjectRoute';

export const setOfIds = ImmutablePropTypes.setOf(
  PropTypes.number,
);

export const components = ImmutablePropTypes.mapOf(
  PropTypes.instanceOf(ProjectComponent),
  PropTypes.number,
);

export const routes = ImmutablePropTypes.mapOf(
  PropTypes.instanceOf(ProjectRoute),
  PropTypes.number,
);

export const componentsTreePosition = PropTypes.shape({
  containerId: PropTypes.number.isRequired,
  afterIdx: PropTypes.number.isRequired,
});

export const componentClipboard = PropTypes.shape({
  componentId: PropTypes.number.isRequired,
  copy: PropTypes.bool.isRequired,
});
