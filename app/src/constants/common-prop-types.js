/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ProjectComponent from '../models/ProjectComponent';

export const SetOfIds = ImmutablePropTypes.setOf(
  PropTypes.number,
);

export const Components = ImmutablePropTypes.mapOf(
  PropTypes.instanceOf(ProjectComponent),
  PropTypes.number,
);

export const ComponentsTreePosition = PropTypes.shape({
  containerId: PropTypes.number.isRequired,
  afterIdx: PropTypes.number.isRequired,
});
