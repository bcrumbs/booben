/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List } from 'immutable';

import { projectRouteToImmutable } from './ProjectRoute';

const ProjectRecord = Record({
    name: '',
    author: '',
    componentLibs: List(),
    relayEndpointURL: null,
    routes: List()
});

export const projectToImmutable = input => new ProjectRecord({
    name: input.name,
    author: input.author,
    componentLibs: List(input.componentLibs),
    relayEndpointURL: input.relayEndpointURL,
    routes: List(input.routes.map(route => projectRouteToImmutable(route, '')))
});

export default ProjectRecord;
 