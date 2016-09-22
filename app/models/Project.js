/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List } from 'immutable';

export default Record({
    name: '',
    author: '',
    componentLibs: List(),
    relayEndpointURL: null,
    routes: List()
});
 