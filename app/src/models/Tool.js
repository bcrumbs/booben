import { Record, List } from 'immutable';

export default Record({
  id: '',
  icon: null,
  name: '',
  title: '',
  titleEditable: false,
  titlePlaceholder: '',
  subtitle: '',
  undockable: true,
  closable: false,
  sections: List(),
  mainButtons: List(),
  secondaryButtons: List(),
  windowMaxHeight: 0,
  windowMinWidth: 0,
});
