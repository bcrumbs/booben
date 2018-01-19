import { Record } from 'immutable';
import { INVALID_ID } from '../constants/misc';

const ClipboardRecord = Record({
  componentId: INVALID_ID,
  copy: false,
});

export default class Clipboard extends ClipboardRecord {
  updateClipboard(componentId, copy) {
    return this.merge({ componentId, copy });
  }

  clearClipboard() {
    return this.updateClipboard(INVALID_ID, false);
  }
}
