import React from 'react';
import * as Reactackle from '@reactackle/reactackle';

/**
 * @param  {String} type [description]
 * @return {[type]}      [description]
 */
const getComponentByType = (type = '') => {
    return Reactackle[type];
}

/**
 * build React component
 * @param  {Object} metaData [scheme for preview app]
 * @return {Function}  [React component for render]
 */
export function getComponentFromMeta (metaData = null) {
    if(metaData) {
        if(Array.isArray(metaData)) {
            return metaData.map((item) => {
                return getComponentFromMeta(item);
            });
        } else {
            let _component = getComponentByType(metaData['type']);

            return <_component {...metaData['props']}>
                {getComponentFromMeta(metaData['children'])}
            </_component>;
        }
    } else {
        return null;
    }
}