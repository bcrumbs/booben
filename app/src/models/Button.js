import { Record } from 'immutable';
import { noop } from '../utils/misc';

export default Record({
  icon: null,
  text: '',
  disabled: false,
  onPress: noop,
});
