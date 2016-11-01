/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 *
 * @type {string}
 */
const API_URL_PREFIX = '/api/v1';

/**
 *
 * @param {string} projectName
 * @return {Promise.<Project>}
 */
export const getProject = projectName =>
    fetch(`${API_URL_PREFIX}/projects/${projectName}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            return data;
        });

/**
 *
 * @param {string} projectName
 * @return {Promise.<Object>}
 */
export const getMetadata = projectName =>
    fetch(`${API_URL_PREFIX}/projects/${projectName}/metadata`)
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            return data;
        });

/**
  * @param {string} language
  * @return {Promise.<Object>}
  */
export const getLocalization = language =>
    fetch(`localization/${language}.json`)
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            return data;
        });
