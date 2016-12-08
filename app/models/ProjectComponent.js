/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List, Map, Set } from 'immutable';

import ProjectComponentProp from './ProjectComponentProp';
import SourceDataStatic from './SourceDataStatic';
import SourceDataData, { QueryPathStep, QueryPathStepArgument } from './SourceDataData';
import SourceDataConst from './SourceDataConst';
import SourceDataAction from './SourceDataAction';
import SourceDataDesigner from './SourceDataDesigner';

import { objectMap, objectForEach } from '../utils/misc';

const ProjectComponentRecord = Record({
    id: -1,
    parentId: -1,
    isNew: false,
    isWrapper: false,
    name: '',
    title: '',
    props: Map(),
    children: List(),
    layout: 0,
    regionsEnabled: Set(),
    routeId: -1,
    isIndexRoute: false
});

const propSourceDataToImmutableFns = {
    static: input => {
        const data = {};

        if (typeof input.value !== 'undefined') {
            if (Array.isArray(input.value)) {
                data.value = List(input.value.map(
                    ({ source, sourceData }) => new ProjectComponentProp({
                        source,
                        sourceData: propSourceDataToImmutable(source, sourceData)
                    }))
                );
            }
            else if (typeof input.value === 'object' && input.value !== null) {
                data.value = Map(objectMap(
                    input.value,

                    ({ source, sourceData }) => new ProjectComponentProp({
                        source,
                        sourceData: propSourceDataToImmutable(source, sourceData)
                    }))
                );
            }
            else {
                data.value = input.value;
            }
        }

        if (typeof input.ownerPropName !== 'undefined')
            data.ownerPropName = input.ownerPropName;

        return new SourceDataStatic(data);
    },

    data: input => new SourceDataData({
        dataContext: List(input.dataContext),
        queryPath: List(input.queryPath.map(step => new QueryPathStep({
            field: step.field,
            args: Map(objectMap(step.args, arg => new QueryPathStepArgument({
                source: arg.source,
                sourceData: propSourceDataToImmutable(arg.source, arg.sourceData)
            })))
        })))
    }),

    const: input => new SourceDataConst(input),
    action: input => new SourceDataAction(input),

    designer: input => new SourceDataDesigner(
        input.component
            ? {
                rootId: input.component.id,
                components: componentsToImmutable(input.component, -1, false, -1)
            }

            : {
                rootId: -1
            }
    )
};

export const propSourceDataToImmutable = (source, sourceData) =>
    propSourceDataToImmutableFns[source](sourceData);

export const projectComponentToImmutable = (input, routeId, isIndexRoute, parentId) =>
    new ProjectComponentRecord({
        id: input.id,
        parentId,
        isNew: !!input.isNew,
        isWrapper: !!input.isWrapper,
        name: input.name,
        title: input.title,

        props: Map(objectMap(input.props, propMeta => new ProjectComponentProp({
            source: propMeta.source,
            sourceData: propSourceDataToImmutable(propMeta.source, propMeta.sourceData)
        }))),

        children: List(input.children.map(childComponent => childComponent.id)),
        layout: typeof input.layout === 'number' ? input.layout : 0,
        regionsEnabled: input.regionsEnabled ? Set(input.regionsEnabled) : Set(),
        routeId,
        isIndexRoute
    });

export const componentsToImmutable = (input, routeId, isIndexRoute, parentId) =>
    Map().withMutations(mut => {
        const visitComponent = (component, parentId) => {
            mut.set(
                component.id,
                projectComponentToImmutable(component, routeId, isIndexRoute, parentId)
            );

            component.children.forEach(childComponent =>
                void visitComponent(childComponent, component.id));
        };

        visitComponent(input, parentId);
    });

export const isRootComponent = component => component.parentId === -1;

export const walkComponentsTree = (components, rootComponentId, visiter) => {
    const component = components.get(rootComponentId);
    visiter(component);

    component.children.forEach(childId =>
        void walkComponentsTree(components, childId, visiter));
};

export const gatherComponentsTreeIds = (components, rootComponentId) =>
    Set().withMutations(ret => void walkComponentsTree(
        components,
        rootComponentId,
        component => void ret.add(component.id)
    ));

export const getValueByPath = (component, propName, path) => path.reduce(
    (acc, cur) => acc.sourceData.value.get(cur),
    component.props.get(propName)
);

export const walkSimpleProps = (component, componentMeta, visitor) => {
    const visitValue = (propValue, propMeta, path) => {
        if (propValue.source === 'static' && !propValue.sourceData.ownerPropName) {
            if (propMeta.type === 'shape' && propValue.sourceData.value !== null) {
                objectForEach(propMeta.fields, (fieldTypedef, fieldName) =>
                    void visitValue(
                        propValue.sourceData.value[fieldName],
                        fieldTypedef,
                        [...path, fieldName]
                    ));
            }
            else if (propMeta.type === 'objectOf' && propValue.sourceData.value !== null) {
                propValue.sourceData.value.forEach((fieldValue, key) =>
                    void visitValue(fieldValue, propMeta.ofType, [...path, key]));
            }
            else if (propMeta.type === 'arrayOf') {
                propValue.sourceData.value.forEach((itemValue, idx) =>
                    void visitValue(itemValue, propMeta.ofType, [...path, idx]));
            }
            else {
                visitor(propValue, propMeta, path);
            }
        }
        else {
            visitor(propValue, propMeta, path);
        }
    };

    component.props.forEach(
        (propValue, propName) => visitValue(
            propValue,
            componentMeta.props[propName],
            [propName]
        )
    );
};

export default ProjectComponentRecord;
