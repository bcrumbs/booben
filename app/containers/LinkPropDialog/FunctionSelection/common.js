/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import { PropTypes } from 'react';

export const FunctionShape = PropTypes.shape({
  title: PropTypes.string,
  description: PropTypes.string,
  args: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    typedef: PropTypes.object,
    isRequired: PropTypes.bool,
    defaultValue: PropTypes.any,
  })),
  returnType: PropTypes.object,
  body: PropTypes.string,
});

export const Functions = PropTypes.objectOf(FunctionShape);
