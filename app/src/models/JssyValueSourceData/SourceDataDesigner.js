/**
 * @author Dmitriy Bizyaev
 */

import { Record, Map } from 'immutable';
import { INVALID_ID } from '../../constants/misc';

export default Record({
  components: Map(),
  rootId: INVALID_ID,
});
