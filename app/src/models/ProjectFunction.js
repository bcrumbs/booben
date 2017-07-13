/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List } from 'immutable';
import { mapListToArray } from '../utils/misc';
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

/**
 *
 * @param {string[]} argNames
 * @param {string} body
 * @return {Function}
 */
export const createJSFunction = (argNames, body) => new Function(
  ...argNames,
  FUNCTION_FNS_ARG_NAME,
  body,
);

/* eslint-enable no-new-func */

export const projectFunctionToImmutable = input => new ProjectFunction({
  title: input.title,
  description: input.description,
  args: List(input.args.map(arg => new ProjectFunctionArgument(arg))),
  body: input.body,
  returnType: input.returnType,
  fn: createJSFunction(input.args.map(arg => arg.name), input.body),
});

export const projectFunctionToJSv1 = fn => ({
  title: fn.title,
  description: fn.description,
  args: mapListToArray(fn.args, arg => arg.toJS()),
  body: fn.body,
  returnType: fn.returnType,
});

export default ProjectFunction;
