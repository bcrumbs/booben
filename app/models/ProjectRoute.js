/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List } from 'immutable';

export default Record({
    id: 0,
    path: '',
    title: '',
    description: '',
    haveIndex: false,
    indexComponent: null,
    haveRedirect: false,
    redirectTo: '',
    component: null,
    children: List()
});
