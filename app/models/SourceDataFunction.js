/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, Map } from 'immutable';

const SourceDataFunction = Record({
  functionSource: 'project',
  function: '',
  args: Map(),
});

export const FunctionArgValue = Record({
  source: '',
  sourceData: null,
});

export default SourceDataFunction;
