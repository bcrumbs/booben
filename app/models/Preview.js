/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List } from 'immutable';

export default Record({
    selectedItems: List(),
    highlightedItems: List()
});
 