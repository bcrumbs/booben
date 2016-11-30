/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List, Map } from 'immutable';

export const QueryPathStepArgument = Record({
    source: '',
    sourceData: null
});

export const QueryPathStep = Record({
    field: '',
    args: Map()
});

export default Record({
    dataContext: List(),
    queryPath: List()
});
