/**
 * @author Dmitriy Bizyaev
 */

import { Record, List } from 'immutable';

const SourceDataFunction = Record({
  // 'project' = user-defined function, 'builtin' = built-in function
  functionSource: 'project',
  function: '',
  args: List(),
});

export default SourceDataFunction;
