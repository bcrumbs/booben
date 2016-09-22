/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List, Map } from 'immutable';

export default Record({
    uid: '',
    name: '',
    title: '',
    props: Map(),
    children: List()
});
 