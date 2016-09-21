/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List } from 'immutable';

export default Record({
    id: '',
    icon: '',
    name: '',
    title: '',
    titleEditable: false,
    subtitle: '',
    undockable: true,
    closable: false,
    sections: List(),
    mainButtons: List(),
    secondaryButtons: List(),
    windowMaxHeight: 0
});
