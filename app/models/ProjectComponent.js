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
    name: '',
    title: '',
    props: Map(),
    children: List(),
    layout: 0,
    regionsEnabled: Set(),
    routeId: -1,
    isIndexRoute: false
});

const propSourceDataToImmutable = {
    static: input => new SourceDataStatic(input),
    data: input => new SourceDataData(input),
    const: input => new SourceDataConst(input),
    action: input => new SourceDataAction(input),
    designer: input => new SourceDataDesigner(input)
};

export const projectComponentToImmutable = (input, routeId, isIndexRoute, parentId) =>
    new ProjectComponentRecord({
        id: input.id,
        parentId,
        isNew: !!input.isNew,
        name: input.name,
        title: input.title,

        props: Map(objectMap(input.props, propMeta => new ProjectComponentProp({
            source: propMeta.source,
            sourceData: propSourceDataToImmutable[propMeta.source](propMeta.sourceData)
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

export default ProjectComponentRecord;
