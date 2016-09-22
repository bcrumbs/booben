/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List } from 'immutable';

export default Record({
    id: 0,
    path: '',
    children: List(),
    component: null
});
 