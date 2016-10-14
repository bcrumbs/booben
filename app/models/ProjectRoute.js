/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List } from 'immutable';

import { projectComponentToImmutable } from './ProjectComponent';

const ProjectRouteRecord = Record({
    id: 0,
    path: '',
    fullPath: '',
    title: '',
    description: '',
    haveIndex: false,
    indexRouteDescription: '',
    indexComponent: null,
    haveRedirect: false,
    redirectTo: '',
    component: null,
    children: List()
});

export const projectRouteToImmutable = (input, pathPrefix) => {
    const fullPath = pathPrefix + input.path,
        nextPrefix = fullPath.endsWith('/') ? fullPath : fullPath + '/';

    return new ProjectRouteRecord({
        id: input.id,
        path: input.path,
        fullPath: fullPath,
        title: input.title,
        description: input.description,
        haveIndex: input.haveIndex,
        indexComponent: input.indexComponent !== null
            ? projectComponentToImmutable(input.indexComponent)
            : null,

        haveRedirect: input.haveRedirect,
        redirectTo: input.redirectTo,

        component: input.component !== null
            ? projectComponentToImmutable(input.component)
            : null,

        children: List(input.children.map(
            route => projectRouteToImmutable(route, nextPrefix))
        )
    });
};

export default ProjectRouteRecord;
