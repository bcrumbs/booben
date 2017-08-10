/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { isCompatibleType } from '@jssy/types';
import { getComponentMeta, getString } from '../../lib/meta';
import { walkSimpleValues } from '../../lib/components';
import { objectSome, objectToArray } from '../../utils/misc';

/**
 *
 * @param {JssyValueDefinition} targetValueDef
 * @param {?Object<string, JssyTypeDefinition>} targetUserTypedefs
 * @param {Immutable.Map<number, Object>} components
 * @param {ComponentsMeta} meta
 * @param {string} language
 * @return {{filter: function(componentId: number): boolean, dataGetter: function(componentId: number): Array<ComponentDataItem>}}
 */
export const getStateSlotPickerFns = (
  targetValueDef,
  targetUserTypedefs,
  components,
  meta,
  language,
) => {
  const filter = componentId => {
    const component = components.get(componentId);
    const componentMeta = getComponentMeta(component.name, meta);

    if (!componentMeta.state) return false;

    return objectSome(
      componentMeta.state,
      stateSlotDef => isCompatibleType(
        targetValueDef,
        stateSlotDef,
        targetUserTypedefs,
        componentMeta.types,
      ),
    );
  };

  const dataGetter = componentId => {
    const component = components.get(componentId);
    const componentMeta = getComponentMeta(component.name, meta);

    return objectToArray(
      componentMeta.state,
      (stateSlotDef, stateSlotName) => ({
        name: getString(
          componentMeta.strings,
          stateSlotDef.textKey,
          language,
        ),

        description: getString(
          componentMeta.strings,
          stateSlotDef.descriptionTextKey,
          language,
        ),

        unavailable: !isCompatibleType(
          targetValueDef,
          stateSlotDef,
          targetUserTypedefs,
          componentMeta.types,
        ),

        data: stateSlotName,
      }),
    );
  };

  return { filter, dataGetter };
};

const componentHasConnectionDataValues = (component, componentMeta) => {
  let ret = false;

  const visitor = jssyValue => {

  };

  const options = {
    meta: null,
    schema: null,
    project: null,
    walkSystemProps: true,
    walkDesignerValues: false,
    walkFunctionArgs: true,
    walkActions: false,
    visitIntermediateNodes: false,
  };

  walkSimpleValues(component, componentMeta, visitor, options);

  return ret;
};

export const getConnectionDataValuePickerFns = (
  components,
  meta,
  schema,
  language,
) => {
  const filter = componentId => {
    const component = components.get(componentId);
    const componentMeta = getComponentMeta(component.name, meta);

    return componentHasConnectionDataValues(component, componentMeta);
  };

  const dataGetter = componentId => {

  };

  return { filter, dataGetter };
};
