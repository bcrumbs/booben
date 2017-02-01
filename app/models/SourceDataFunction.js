/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, Map } from 'immutable';

const SourceDataFunction = Record({
  functionSource: 'project', // project = user-defined function
  function: '',
  args: Map(),
});

export default SourceDataFunction;
