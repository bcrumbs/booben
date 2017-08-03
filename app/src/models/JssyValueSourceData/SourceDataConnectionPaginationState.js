/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record } from 'immutable';

export default Record({
  param: '', // Can only be "endCursor" for now
  dataValue: null,
  queryStep: 0,
});
