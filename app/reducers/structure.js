/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { STRUCTURE_SELECT_ROUTE } from '../actions/structure';
import { Record, List } from 'immutable';

const StructureState = Record({
    selectedRouteId: -1,
    indexRouteSelected: false
});

export default (state = new StructureState(), action) => {
    switch (action.type) {
        case STRUCTURE_SELECT_ROUTE:
            return state.merge({
                selectedRouteId: action.routeId,
                indexRouteSelected: action.indexRouteSelected
            });

        default:
            return state;
    }
};
