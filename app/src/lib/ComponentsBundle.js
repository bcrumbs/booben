/**
 * @author Dmitriy Bizyaev
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import _mapValues from 'lodash.mapvalues';
import patchComponent from '../hocs/patchComponent';
import { parseComponentName } from './meta';

import {
  COMPONENTS_BUNDLE_FILE,
  REACT_COMPATIBILITY_MODE,
  REACT_COMPATIBILITY_MODE_WARNINGS,
} from '../config';

import { URL_BUNDLE_PREFIX } from '../../../shared/constants';

const scriptsCache = {};

/**
 *
 * @param {string} url
 * @return {Promise<string>}
 */
const loadScript = async url => {
  const cached = scriptsCache[url];
  if (cached) return cached;
  
  const res = await fetch(url);
  const script = await res.text();
  
  scriptsCache[url] = script;
  return script;
};

/**
 *
 * @param {Window} windowInstance
 * @param {string} url
 * @return {Promise<void>}
 */
const loadComponentsBundleIntoWindow = async (windowInstance, url) => {
  const document = windowInstance.document;
  const script = document.createElement('script');
  
  script.type = 'application/javascript';
  document.body.appendChild(script);
  script.text = await loadScript(url);
};

export default class ComponentsBundle {
  constructor(projectName, windowInstance) {
    this._windowInstance = windowInstance;
    this._projectName = projectName;
    this._loading = false;
    this._loaded = false;
    this._components = null;
  }

  /**
   *
   * @return {Promise<void>}
   */
  async loadComponents({ patchComponents = false } = {}) {
    if (this._loaded) {
      throw new Error(
        'ComponentsBundle#loadComponents(): components already loaded',
      );
    }

    if (this._loading) {
      throw new Error(
        'ComponentsBundle#loadComponents(): components already loading',
      );
    }

    this._loading = true;

    // These modules are external in the components bundle
    this._windowInstance.React = React;
    this._windowInstance.ReactDOM = ReactDOM;
    this._windowInstance.PropTypes = PropTypes;

    if (REACT_COMPATIBILITY_MODE) {
      /* eslint-disable no-console */
      if (!this._windowInstance.React.PropTypes) {
        Object.defineProperty(this._windowInstance.React, 'PropTypes', {
          get: () => {
            if (REACT_COMPATIBILITY_MODE_WARNINGS) {
              console.warn(
                'React compatibility mode: React.PropTypes was used',
              );
            }

            return PropTypes;
          },
        });
      }

      if (!this._windowInstance.React.createClass) {
        Object.defineProperty(this._windowInstance.React, 'createClass', {
          get: () => {
            if (REACT_COMPATIBILITY_MODE_WARNINGS) {
              console.warn(
                'React compatibility mode: React.createClass was used',
              );
            }

            return createReactClass;
          },
        });
      }
      /* eslint-enable no-console */
    }

    await loadComponentsBundleIntoWindow(
      this._windowInstance,
      `${URL_BUNDLE_PREFIX}/${this._projectName}/${COMPONENTS_BUNDLE_FILE}`,
    );

    const noComponents =
      !this._windowInstance.JssyComponents ||
      !this._windowInstance.JssyComponents.default;

    if (noComponents) {
      throw new Error(
        'ComponentsBundle#loadComponents(): No components in bundle',
      );
    }

    if (patchComponents) {
      this._components = _mapValues(
        this._windowInstance.JssyComponents.default,
        ns => _mapValues(ns, patchComponent),
      );
    } else {
      this._components = this._windowInstance.JssyComponents.default;
    }

    this._loading = false;
    this._loaded = true;
  }

  /**
   *
   * @param {string} componentName
   * @return {string|Function}
   */
  getComponentByName(componentName) {
    if (!this._loaded) {
      throw new Error(
        'ComponentsBundle#getComponentByName: components not loaded',
      );
    }

    const { namespace, name } = parseComponentName(componentName);

    if (!namespace || !name) {
      throw new Error(
        'ComponentsBundle#getComponentByName: ' +
        `Invalid component name: '${componentName}'`,
        );
    }

    if (!this._components[namespace]) {
      throw new Error(
        'ComponentsBundle#getComponentByName: ' +
        `Namespace not found: '${namespace}'`,
        );
    }

    const component = this._components[namespace][name];

    if (!component) {
      throw new Error(
        'ComponentsBundle#getComponentByName: ' +
        `Component not found: '${componentName}'`,
        );
    }

    return component;
  }
}
