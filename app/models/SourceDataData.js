/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List } from 'immutable';

export const QueryPathStep = Record({
  field: '',
});

export default Record({
  dataContext: List(),
  queryPath: null,
});
