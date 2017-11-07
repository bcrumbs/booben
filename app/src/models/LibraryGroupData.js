/**
 * @author Dmitriy Bizyaev
 */

import { Record, List } from 'immutable';

export default Record({
  name: '',
  namespace: '',
  text: null,
  descriptionText: null,
  textIntlKey: '',
  descriptionIntlKey: '',
  isDefault: false,
  components: List(),
});
