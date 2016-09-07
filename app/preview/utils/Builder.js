import React from 'react';
import * as Backend from './Backend';

import * as Reactackle from '@reactackle/reactackle';

/**
 * [getComponentByType get component from server]
 * @param  {String} type [description]
 * @return {[type]}      [description]
 */
const getComponentByType = (type = '') => {
    return Reactackle[type];
}

/**
 * [getComponentFromMeta compose React component]
 * @param  {Object} metaData [scheme for preview app]
 * @return {React Function}  [React component for render]
 */
const getComponentFromMeta = (metaData = null) => {
    if(metaData) {
        if(Array.isArray(metaData)) {
            return metaData.map((item) => {
                return getComponentFromMeta(item);
            });
        } else {
            let _component = getComponentByType(metaData['type']);

            return React.createElement(
                _component,
                {
                    onClick: (e) => {window.hoistingEventToConstructor(e)},
                    ...metaData['props']
                },
                getComponentFromMeta(metaData['children'])
            );
        }
    } else {
        return null;
    }
}

/**
 * [getComponentByProject description]
 * @param  {String} projectID [description]
 * @return {React Function}   [description]
 */
export function getComponentByProject(projectID) {
    let config = getProjectConfig(projectID);
    let metaData = Backend.fetch();

    return getComponentFromMeta(metaData);
}

/**
 * [getProjectConfig description]
 * @return {[Object]} [project config]
 */
export function getProjectConfig() {
    return {};
}