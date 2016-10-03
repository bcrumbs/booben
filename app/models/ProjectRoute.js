/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List } from 'immutable';

export default Record({
    id: 0,
    path: '',
    isIndex: false,
    title: '',
    description: '',
    children: List(),
    component: null
});
