/**
 * @author Dmitriy Bizyaev
 */

import { Record } from 'immutable';
import { INVALID_ID } from '../constants/misc';

const CursorRecord = Record({
  containerId: INVALID_ID,
  afterIdx: -1,
});

export default class Cursor extends CursorRecord {
  setPosition(containerId, afterIdx) {
    return this.merge({ containerId, afterIdx });
  }
}
