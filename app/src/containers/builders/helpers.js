import Immutable from 'immutable';
import forOwn from 'lodash.forown';
import { List } from './List/List';
import { Text } from './Text/Text';
import JssyValue, { ActionTypes, isAsyncAction } from '../../models/JssyValue';
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
 *
 * @param {ProjectComponent} component
 * @return {boolean}
 */
export const isEmptyListComponent = component => {
  if (component.id === INVALID_ID) return false;

  return component.name === 'List' &&
    !component.getIn(['props', 'data']).isLinkedWithData();
};

/**
 * @typedef {Object} RenderHints
 * @property {Set<number>} needRefs
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
    needRefs: new Set(),
    activeStateSlots: new Map(),
  };

  if (rootId === INVALID_ID) return ret;

  const visitAction = action => {
    if (
      action.type === ActionTypes.METHOD ||
      action.type === ActionTypes.LOAD_MORE_DATA
    ) {
      ret.needRefs.add(action.params.componentId);
    }

    if (isAsyncAction(action.type)) {
      action.params.successActions.forEach(visitAction);
      action.params.errorActions.forEach(visitAction);
    }
  };

  const visitNode = node => {
    if (!(node instanceof JssyValue)) return;

    if (node.sourceIs(JssyValue.Source.ACTIONS)) {
      node.sourceData.actions.forEach(visitAction);
    } else if (node.sourceIs(JssyValue.Source.STATE)) {
      let activeStateSlotsForComponent =
        ret.activeStateSlots.get(node.sourceData.componentId);

      if (!activeStateSlotsForComponent) {
        activeStateSlotsForComponent = new Set();
        ret.activeStateSlots.set(
          node.sourceData.componentId,
          activeStateSlotsForComponent,
        );
      }

      activeStateSlotsForComponent.add(node.sourceData.stateSlot);
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
      visitNode,
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
      forOwn(values, (value, slotName) => void map.set(slotName, value));
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
    return componentsBundle.getStyledHTMLComponent(name);
  } else if (namespace === '') {
    if (name === 'List') return List;
    if (name === 'Text') return Text;
    return null;
  } else {
    return componentsBundle.getComponentByName(componentName);
  }
};
