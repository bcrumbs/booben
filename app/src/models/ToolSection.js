/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record } from 'immutable';
import { returnNull } from '../utils/misc';

export default Record({
  name: '',
  component: returnNull,
  componentProps: {},
  sideRegionComponent: returnNull,
  sideRegionComponentProps: {},
});
