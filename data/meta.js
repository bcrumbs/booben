/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 * @typedef {Object} ComponentMeta
 * @property {string} displayName
 * @property {string} textKey
 * @property {string} descriptionTextKey
 * @property {string} kind - Can be "atomic" or "container"
 * @property {Object.<string, ComponentPropMeta>} props
 */

/**
 * @typedef {Object} ComponentPropMeta
 * @property {string} textKey
 * @property {string} descriptionTextKey
 * @property {string} type
 * @property {Object} [ofType] - For "arrayOf" type only
 * @property {Object.<string, ComponentPropMeta>} [fields] - For "shape" type only
 * @property {OneOfOption[]} [options] - For "oneOf" type only
 * @property {string[]} source
 * @property {Object} [sourceConfigs]
 * @property {StaticSourceConfig} [sourceConfigs.static]
 * @property {DataSourceConfig} [sourceConfigs.data]
 * @property {ConstSourceConfig} [sourceConfigs.const]
 * @property {DesignerSourceConfig} [sourceConfigs.designer]
 */

/**
 * @typedef {Object} OneOfOption
 * @property {string} textKey
 * @property {*} value
 */

/**
 * @typedef {Object} StaticSourceConfig
 * @property {*} [default] - Default value (for scalar types only)
 * @property {number} [defaultNum] - Default items num (to arrayOf type only)
 * @property {number} [minItems] - Min items num (to arrayOf type only)
 * @property {number} [maxItems] - Max items num (to arrayOf type only)
 */

// TODO: Define DataSourceConfig
/**
 * @typedef {Object} DataSourceConfig
 */

/**
 * @typedef {Object} ConstSourceConfig
 * @property {*} [value]
 * @property {string} [jssyConstId] - ID of built-in constant
 */

/**
 * @typedef {Object} DesignerSourceConfig
 * @property {string} wrapper - Wrapper component name
 */
