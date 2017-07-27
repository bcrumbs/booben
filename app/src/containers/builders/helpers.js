/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import Immutable from 'immutable';
import _forOwn from 'lodash.forown';
import { List } from './List/List';
import { Text } from './Text/Text';
import { parseComponentName, getComponentMeta } from '../../lib/meta';
import { walkComponentsTree, walkSimpleValues } from '../../lib/components';
import { buildInitialComponentState } from '../../lib/values';
import { isDef } from '../../utils/misc';
import { INVALID_ID } from '../../constants/misc';

/**
 *
 * @type {Set<string>}
 * @const
 */
const PSEUDO_COMPONENTS = new Set(['Outlet']);

/**
 *
 * @param {ProjectComponent} component
 * @return {boolean}
 */
export const isPseudoComponent = component =>
  PSEUDO_COMPONENTS.has(component.name);

/**
 * @typedef {Object} RenderHints
 * @property {Set<number>} methodCallTargets
 * @property {Map<number, Set<string>>} activeStateSlots
 */

/**
 *
 * @param {Immutable.Map<number, Object>} components
 * @param {number} rootId
 * @param {Object<string, Object<string, ComponentMeta>>} meta
 * @param {?DataSchema} schema
 * @param {Object} project
 * @return {RenderHints}
 */
export const getRenderHints = (components, rootId, meta, schema, project) => {
  const ret = {
    methodCallTargets: new Set(),
    activeStateSlots: new Map(),
  };

  if (rootId === INVALID_ID) return ret;

  const visitAction = action => {
    if (action.type === 'method') {
      ret.methodCallTargets.add(action.params.componentId);
    } else if (action.type === 'mutation' || action.type === 'ajax') {
      action.params.successActions.forEach(visitAction);
      action.params.errorActions.forEach(visitAction);
    }
  };

  const visitValue = jssyValue => {
    if (jssyValue.source === 'actions') {
      jssyValue.sourceData.actions.forEach(visitAction);
    } else if (jssyValue.source === 'state') {
      let activeStateSlotsForComponent =
        ret.activeStateSlots.get(jssyValue.sourceData.componentId);

      if (!activeStateSlotsForComponent) {
        activeStateSlotsForComponent = new Set();
        ret.activeStateSlots.set(
          jssyValue.sourceData.componentId,
          activeStateSlotsForComponent,
        );
      }

      activeStateSlotsForComponent.add(jssyValue.sourceData.stateSlot);
    }
  };

  const walkSimpleValuesOptions = {
    project,
    schema,
    walkSystemProps: true,
    walkFunctionArgs: true,
    walkActions: true,
    visitIntermediateNodes: true,
  };

  walkComponentsTree(components, rootId, component => {
    const componentMeta = getComponentMeta(component.name, meta);

    walkSimpleValues(
      component,
      componentMeta,
      visitValue,
      walkSimpleValuesOptions,
    );
  });

  return ret;
};

/**
 *
 * @param {Immutable.Map<number, Object>} components
 * @param {Object<string, Object<string, ComponentMeta>>} meta
 * @param {RenderHints} renderHints
 * @param {?ValueContext} [valueContext=null]
 * @return {Immutable.Map<number, Immutable.Map<string, *>>}
 * @private
 */
export const getInitialComponentsState = (
  components,
  meta,
  renderHints,
  valueContext = null,
) => {
  let componentsState = Immutable.Map();

  renderHints.activeStateSlots.forEach((slotNames, componentId) => {
    const component = components.get(componentId);
    const values = buildInitialComponentState(
      component,
      meta,
      valueContext,
      Array.from(slotNames),
    );

    const componentState = Immutable.Map().withMutations(map => {
      _forOwn(values, (value, slotName) => void map.set(slotName, value));
    });

    componentsState = componentsState.set(componentId, componentState);
  });

  return componentsState;
};

/**
 *
 * @param {Immutable.Map<number, Immutable.Map<string, *>>} oldState
 * @param {Immutable.Map<number, Immutable.Map<string, *>>} newState
 * @return {Immutable.Map<number, Immutable.Map<string, *>>}
 */
export const mergeComponentsState = (oldState, newState) => newState.map(
  (componentState, componentId) => componentState.map(
    (newValue, slotName) => {
      const oldValue = oldState.getIn([componentId, slotName]);
      return isDef(oldValue) ? oldValue : newValue;
    },
  ),
);

/**
 *
 * @param {string} componentName
 * @param {ComponentsBundle} componentsBundle
 * @return {string|Function}
 */
export const getComponentByName = (componentName, componentsBundle) => {
  const { name, namespace } = parseComponentName(componentName);

  if (namespace === 'HTML') {
    return name;
  } else if (namespace === '') {
    if (name === 'List') return List;
    if (name === 'Text') return Text;
    return null;
  } else {
    return componentsBundle.getComponentByName(componentName);
  }
};
