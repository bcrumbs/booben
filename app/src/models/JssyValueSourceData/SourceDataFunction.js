/**
 * @author Dmitriy Bizyaev
 */

import { Record, Map } from 'immutable';

const SourceDataFunction = Record({
  // 'project' = user-defined function, 'builtin' = built-in function
  functionSource: 'project',
  function: '',
  args: Map(),
});

export default SourceDataFunction;
