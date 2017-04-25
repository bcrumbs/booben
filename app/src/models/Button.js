/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record } from 'immutable';
import { noop } from '../utils/misc';

export default Record({
  icon: '',
  text: '',
  disabled: false,
  onPress: noop,
});
