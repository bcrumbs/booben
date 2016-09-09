/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export const getProject = projectName =>
    fetch(`/api/v1/projects/${projectName}`).then(res => res.json());
