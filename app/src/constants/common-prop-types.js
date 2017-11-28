/**
 * @author Dmitriy Bizyaev
 */

import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ProjectComponent from '../models/ProjectComponent';
import ProjectRoute from '../models/ProjectRoute';
import { Action } from '../models/JssyValue';
import Tool from '../models/Tool';
import ToolState from '../models/ToolState';

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

export const actions = ImmutablePropTypes.listOf(
  PropTypes.instanceOf(Action),
);

export const componentsTreePosition = PropTypes.shape({
  containerId: PropTypes.number.isRequired,
  afterIdx: PropTypes.number.isRequired,
});

export const componentClipboard = PropTypes.shape({
  componentId: PropTypes.number.isRequired,
  copy: PropTypes.bool.isRequired,
});

export const toolGroups = ImmutablePropTypes.listOf(
  ImmutablePropTypes.listOf(PropTypes.instanceOf(Tool)),
);

export const toolStates = ImmutablePropTypes.mapOf(
  PropTypes.instanceOf(ToolState),
  PropTypes.string,
);

<<<<<<< HEAD
export const componentDataItem = PropTypes.shape({
=======
export const componentDataItem = ImmutablePropTypes.listOf(PropTypes.shape({
>>>>>>> b9ae5b39f382dbe220f487f8ccb96f3f14a7f5ee
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  unavailable: PropTypes.bool,
  data: PropTypes.any.isRequired,
<<<<<<< HEAD
});
=======
}));

export const componentDataItemList = ImmutablePropTypes.listOf(
  componentDataItem,
);
>>>>>>> b9ae5b39f382dbe220f487f8ccb96f3f14a7f5ee
