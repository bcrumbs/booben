/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List } from 'immutable';
import { FUNCTION_FNS_ARG_NAME } from '../constants/misc';

export const ProjectFunctionArgument = Record({
  name: '',
  description: '',
  typedef: null,
  isRequired: false,
  defaultValue: null,
});

/* eslint-disable no-new-func */

const ProjectFunction = Record({
  title: '',
  description: '',
  args: List(),
  body: '',
  returnType: null,
  fn: new Function('return void 0;'),
});

export const projectFunctionToImmutable = input => new ProjectFunction({
  title: input.title,
  description: input.description,
  args: List(input.args.map(arg => {
    const argRecord = new ProjectFunctionArgument(arg);
    
    // We need typedef and defaultValue to be plain JS objects
    return argRecord
      .set('typedef', arg.typedef)
      .set('defaultValue', arg.defaultValue);
  })),
  body: input.body,
  returnType: input.returnType,
  fn: new Function(
    ...input.args.map(arg => arg.name),
    FUNCTION_FNS_ARG_NAME,
    input.body,
  ),
});

/* eslint-enable no-new-func */

export default ProjectFunction;
