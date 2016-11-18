/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List, Map, Set } from 'immutable';

import ProjectComponentProp from './ProjectComponentProp';
import SourceDataStatic from './SourceDataStatic';
import SourceDataData from './SourceDataData';
import SourceDataConst from './SourceDataConst';
import SourceDataAction from './SourceDataAction';
import SourceDataDesigner from './SourceDataDesigner';

import { objectMap } from '../utils/misc';

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
    data: input => new SourceDataData(input),
    const: input => new SourceDataConst(input),
    action: input => new SourceDataAction(input),

    designer: input => new SourceDataDesigner(
        input.component
            ? {
                rootId: input.component.id,
                components: componentsToImmutable(input.component, -1, false, -1)
            }

            : {
                rootId: -1,
                components: null
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

export const gatherComponentsTreeIds = (components, rootComponentId) =>
    Set().withMutations(ret => {
        const visitComponent = component => {
            ret.add(component.id);

            component.children.forEach(childComponentId =>
                void visitComponent(components.get(childComponentId)));
        };

        visitComponent(components.get(rootComponentId));
    });

export default ProjectComponentRecord;
