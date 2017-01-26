/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// TODO: Rename to JssyValue.js

import { Record, Map, List } from 'immutable';
import _mapValues from 'lodash.mapvalues';
import SourceDataStatic from './SourceDataStatic';

const JssyValue = Record({
  source: '',
  sourceData: null,
});

export const staticJssyValueFromJs = value => {
  if (Array.isArray(value)) {
    return new JssyValue({
      source: 'static',
      sourceData: new SourceDataStatic({
        value: List(value.map(staticJssyValueFromJs)),
      }),
    });
  } else if (typeof value === 'object' && value !== null) {
    return new JssyValue({
      source: 'static',
      sourceData: new SourceDataStatic({
        value: Map(_mapValues(value, staticJssyValueFromJs)),
      }),
    });
  } else {
    return new JssyValue({
      source: 'static',
      sourceData: new SourceDataStatic({ value }),
    });
  }
};

export default JssyValue;
