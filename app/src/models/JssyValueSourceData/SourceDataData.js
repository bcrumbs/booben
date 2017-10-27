/**
 * @author Dmitriy Bizyaev
 */

import { Record, List, Map } from 'immutable';

export const QueryPathStep = Record({
  field: '',
  connectionPageSize: 10,
});

let nextAliasPostfix = 0;

const _SourceDataData = Record({
  dataContext: List(),
  queryPath: null,
  queryArgs: Map(),
  aliasPostfix: '',
});

export default class SourceDataData extends _SourceDataData {
  constructor(data) {
    super({
      ...data,
      aliasPostfix: String(nextAliasPostfix++),
    });
  }
}
