/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List, Map } from 'immutable';

export default Record({
    id: '',
    name: '',
    title: '',
    props: Map(),
    children: List()
});
 