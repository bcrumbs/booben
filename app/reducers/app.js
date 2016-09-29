/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import {
    APP_SET_LANGUAGE
} from '../actions/app';

import { Record } from 'immutable';

const AppState = Record({
    language: 'en'
});

export default (state = new AppState(), action) => {
    switch (action.type) {
        case APP_SET_LANGUAGE:
            return state.set('language', action.language);

        default:
            return state;
    }
};
