/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List, Map } from 'immutable';

import ProjectComponentProp from './ProjectComponentProp';
import SourceDataStatic from './SourceDataStatic';
import SourceDataData from './SourceDataData';
import SourceDataConst from './SourceDataConst';
import SourceDataAction from './SourceDataAction';
import SourceDataDesigner from './SourceDataDesigner';

import { objectMap } from '../utils/misc';

const ProjectComponentRecord = Record({
    id: null,
    name: '',
    title: '',
    props: Map(),
    children: List()
});

/**
 *
 * @type {Object<string, function(input: Object): Immutable.Record>}
 * @const
 */
const propSourceDataToImmutable = {
    static: input => new SourceDataStatic(input),
    data: input => new SourceDataData(input),
    const: input => new SourceDataConst(input),
    action: input => new SourceDataAction(input),
    designer: input => new SourceDataDesigner(input)
};

/**
 *
 * @param {Object} input
 * @returns {ProjectComponent}
 */
export const projectComponentToImmutable = input => new ProjectComponentRecord({
    id: input.id,
    name: input.name,
    title: input.title,

    props: Map(objectMap(input.props, propMeta => new ProjectComponentProp({
        source: propMeta.source,
        sourceData: propSourceDataToImmutable[propMeta.source](propMeta.sourceData)
    }))),

    children: List(input.children.map(projectComponentToImmutable))
});

export default ProjectComponentRecord;
 