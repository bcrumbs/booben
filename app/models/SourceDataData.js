/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List } from 'immutable';

export const QueryPathStep = Record({
  field: '',
});

let nextAliasPostfix = 0;

export default Record({
  dataContext: List(),
  queryPath: null,
  queryArgs: List(),
  aliasPostfix: String(nextAliasPostfix++),
});
