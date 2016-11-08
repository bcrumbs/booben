/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co'),
    path = require('path'),
    fs = require('mz/fs'),
    rv = require('revalidator'),
    AsyncTreeWalker = require('@common/tree').AsyncTreeWalker,
    constants = require('../../common/constants');

/**
 *
 * @type {Set}
 */
const internalTypes = new Set([
    'string',
    'bool',
    'int',
    'float',
    'oneOf',
    'object',
    'shape',
    'array',
    'arrayOf',
    'func',
    'component'
]);

const propSchema = {
    type: 'object',
    properties: {
        textKey: {
            type: 'string',
            allowEmpty: true,
            required: false
        },

        descriptionTextKey: {
            type: 'string',
            allowEmpty: true,
            required: false
        },

        group: {
            type: 'string',
            allowEmpty: false,
            required: false
        },

        type: {
            type: 'string',
            allowEmpty: false,
            required: true
        },

        source: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: {
                type: 'string',
                enum: [
                    'static',
                    'data',
                    'const',
                    'designer',
                    'actions'
                ]
            },
            required: false
        },

        sourceConfigs: {
            type: 'object',
            properties: {
                static: {
                    type: 'object',
                    properties: {
                        default: {
                            type: 'any',
                            required: false
                        },

                        // For 'string' type
                        defaultTextKey: {
                            type: 'string',
                            required: false
                        },

                        // For 'arrayOf' type
                        defaultNum: {
                            type: 'integer',
                            required: false
                        },

                        minItems: {
                            type: 'integer',
                            required: false
                        },

                        maxItems: {
                            type: 'integer',
                            required: false
                        }
                    },
                    required: false
                },

                data: {
                    type: 'object',
                    properties: {

                    },
                    required: false
                },

                const: {
                    type: 'object',
                    properties: {
                        value: {
                            type: 'any',
                            required: false
                        },

                        jssyConstId: {
                            type: 'string',
                            required: false
                        }
                    },
                    required: false
                },

                designer: {
                    type: 'object',
                    properties: {
                        wrapper: {
                            type: 'string',
                            required: false
                        }
                    },
                    required: false
                },

                actions: {
                    type: 'object',
                    properties: {

                    },
                    required: false
                },

                interpolations: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            allowEmpty: false,
                            required: true
                        }
                    },
                    required: false
                }
            },
            required: false
        },

        // For 'arrayOf' type
        ofType: null, // Will be replaced

        // For 'shape' type
        fields: {
            type: 'object',
            patternProperties: {
                '.*': null // Will be replaced
            },
            required: false
        },

        // For 'oneOf' type
        options: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                properties: {
                    value: {
                        type: 'any',
                        required: true
                    },

                    textKey: {
                        type: 'string',
                        allowEmpty: false,
                        required: true
                    }
                }
            },
            required: false
        }
    }
};

propSchema.properties.fields.patternProperties['.*'] = propSchema;
propSchema.properties.ofType = Object.assign({ required: false }, propSchema);

const typesSchema = {
    type: 'object',
    patternProperties: {
        '.*': {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['oneOf', 'arrayOf', 'shape'],
                    required: true
                },

                // For 'arrayOf' type
                ofType: Object.assign({ required: false }, propSchema),

                // For 'shape' type
                fields: {
                    type: 'object',
                    patternProperties: {
                        '.*': propSchema
                    },
                    required: false
                },

                // For 'oneOf' type
                options: {
                    type: 'array',
                    minItems: 1,
                    items: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'any',
                                required: true
                            },

                            textKey: {
                                type: 'string',
                                allowEmpty: false,
                                required: true
                            }
                        }
                    },
                    required: false
                }
            }
        }
    }
};

const stringsSchema = {
    type: 'object',
    patternProperties: {
        '.*': {
            type: 'object',
            patternProperties: {
                '.*': {
                    type: 'string'
                }
            }
        }
    }
};

const metaSchema = {
    type: 'object',
    properties: {
        displayName: {
            type: 'string',
            allowEmpty: false,
            required: true
        },

        textKey: {
            type: 'string',
            allowEmpty: false,
            required: true
        },

        descriptionTextKey: {
            type: 'string',
            allowEmpty: true,
            required: false
        },

        group: {
            type: 'string',
            allowEmpty: false,
            required: false
        },

        tags: {
            type: 'array',
            items: {
                type: 'string',
                allowEmpty: false
            },
            uniqueItems: true,
            required: false
        },

        kind: {
            type: 'string',
            enum: ['atomic', 'container', 'composite'],
            required: true
        },

        hidden: {
            type: 'boolean',
            required: false
        },

        icon: {
            type: 'string',
            allowEmpty: false,
            required: false
        },

        props: {
            type: 'object',
            patternProperties: {
                '.*': propSchema
            },
            required: false
        },

        propGroups: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        allowEmpty: false,
                        required: true
                    },
                    textKey: {
                        type: 'string',
                        allowEmpty: false,
                        required: true
                    }
                }
            },
            required: false
        },

        types: Object.assign({ required: false }, typesSchema),

        strings: Object.assign({ required: false }, stringsSchema),

        layouts: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    textKey: {
                        type: 'string',
                        allowEmpty: false,
                        required: false
                    },
                    descriptionTextKey: {
                        type: 'string',
                        allowEmpty: false,
                        required: false
                    },
                    icon: {
                        type: 'string',
                        allowEmpty: false,
                        required: false
                    },
                    regions: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                component: {
                                    type: 'string',
                                    allowEmpty: false,
                                    required: true
                                },
                                textKey: {
                                    type: 'string',
                                    allowEmpty: false,
                                    required: true
                                },
                                descriptionTextKey: {
                                    type: 'string',
                                    allowEmpty: false,
                                    required: true
                                },
                                defaultEnabled: {
                                    type: 'boolean',
                                    required: true
                                },
                                props: {
                                    type: 'object',
                                    required: false
                                }
                            }
                        },
                        minItems: 1,
                        required: true
                    }
                }
            },
            minItems: 1,
            required: false
        },

        placement: {
            type: 'object',
            properties: {
                inside: {
                    type: 'object',
                    properties: {
                        include: {
                            type: 'array',
                            minItems: 1,
                            items: {
                                type: 'object',
                                properties: {
                                    all: {
                                        type: 'boolean',
                                        required: false
                                    },
                                    component: {
                                        type: 'string',
                                        allowEmpty: false,
                                        required: false
                                    },
                                    group: {
                                        type: 'string',
                                        allowEmpty: false,
                                        required: false
                                    },
                                    tag: {
                                        type: 'string',
                                        allowEmpty: false,
                                        required: false
                                    },
                                    maxNum: {
                                        type: 'number',
                                        minimum: 1,
                                        required: false
                                    }
                                }
                            }
                        },

                        exclude: {
                            type: 'array',
                            minItems: 1,
                            items: {
                                type: 'object',
                                properties: {
                                    component: {
                                        type: 'string',
                                        allowEmpty: false,
                                        required: false
                                    },
                                    group: {
                                        type: 'string',
                                        allowEmpty: false,
                                        required: false
                                    },
                                    tag: {
                                        type: 'string',
                                        allowEmpty: false,
                                        required: false
                                    }
                                }
                            }
                        }
                    },
                    required: false
                },
                after: {
                    // Not used yet
                    type: 'object',
                    properties: {
                        include: {
                            type: 'array',
                            minItems: 1,
                            items: {
                                type: 'object',
                                properties: {
                                    component: {
                                        type: 'string',
                                        allowEmpty: false,
                                        required: false
                                    },
                                    group: {
                                        type: 'string',
                                        allowEmpty: false,
                                        required: false
                                    }
                                }
                            }
                        },

                        exclude: {
                            type: 'array',
                            minItems: 1,
                            items: {
                                type: 'object',
                                properties: {
                                    component: {
                                        type: 'string',
                                        allowEmpty: false,
                                        required: false
                                    },
                                    group: {
                                        type: 'string',
                                        allowEmpty: false,
                                        required: false
                                    }
                                }
                            }
                        }
                    },
                    required: false
                },
                before: {
                    // Not used yet
                    type: 'object',
                    properties: {
                        include: {
                            type: 'array',
                            minItems: 1,
                            items: {
                                type: 'object',
                                properties: {
                                    component: {
                                        type: 'string',
                                        allowEmpty: false,
                                        required: false
                                    },
                                    group: {
                                        type: 'string',
                                        allowEmpty: false,
                                        required: false
                                    }
                                }
                            }
                        },

                        exclude: {
                            type: 'array',
                            minItems: 1,
                            items: {
                                type: 'object',
                                properties: {
                                    component: {
                                        type: 'string',
                                        allowEmpty: false,
                                        required: false
                                    },
                                    group: {
                                        type: 'string',
                                        allowEmpty: false,
                                        required: false
                                    }
                                }
                            }
                        }
                    },
                    required: false
                }
            },
            required: false
        }
    }
};

const mainMetaSchema = {
    properties: {
        namespace: {
            type: 'string',
            allowEmpty: false,
            required: true
        },

        globalStyle: {
            type: 'boolean',
            required: true
        },

        loaders: {
            type: 'object',
            patternProperties: {
                '.*': {
                    type: 'array',
                    minItems: 1,
                    items: {
                        type: 'string',
                        allowEmpty: false
                    }
                }
            },
            required: false,
        },

        import: {
            type: 'array',
            required: false,
            uniqueItems: true,
            items: {
                type: 'string',
                allowEmpty: false
            }
        },

        components: {
            type: 'object',
            patternProperties: {
                '.*': metaSchema
            },
            required: false
        },

        componentGroups: {
            patternProperties: {
                '.*': {
                    type: 'object',
                    properties: {
                        textKey: {
                            type: 'string',
                            allowEmpty: false,
                            required: true
                        },

                        descriptionTextKey: {
                            type: 'string',
                            allowEmpty: false,
                            required: false
                        }
                    }
                }
            },
            required: false
        },

        strings: Object.assign({ required: false }, stringsSchema),

        tags: {
            patternProperties: {
                '.*': {
                    type: 'array',
                    minItems: 1,
                    items: {
                        type: 'string',
                        allowEmpty: false
                    },
                    uniqueItems: true
                }
            },
            required: false
        }
    }
};

const isNumber = value => typeof value === 'number' && !isNaN(value) && isFinite(value);

const propertiesAreEqual = (object1, object2) => {
    const keys1 = Object.keys(object1),
        keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(key => object2.hasOwnProperty(key));
};

const everyProperty = (object, predicate) =>
    Object.keys(object).every(key => predicate(object[key], key, object));

const valueValidators = {
    'string': value => typeof value === 'string',
    'bool': value => typeof value === 'boolean',
    'int': value => isNumber(value) && value % 1 === 0,
    'float': value => isNumber(value),
    'oneOf': (value, typedef) => typedef.options.some(option => option.value === value),
    'array': value => Array.isArray(value),

    'arrayOf': (value, typedef) =>
        Array.isArray(value) && value.every(item => isValidValue(item, typedef.ofType)),

    'object': value => typeof value === 'object', // It can be null

    'shape': (value, typedef) =>
        typeof value === 'object' && (
            value === null || (
                propertiesAreEqual(
                    value,
                    typedef.fields
                ) &&

                everyProperty(
                    value,

                    (fieldValue, fieldName) =>
                        isValidValue(fieldValue, typedef.fields[fieldName])
                )
            )
        ),

    'component': value => true, // TODO: Write validator for component-type value
    'func': value => true // TODO: Write validator for func-type value
};

const isValidValue = (value, typedef) => valueValidators[typedef.type](value, typedef);

const typePrinters = {
    'string': () => 'string',
    'bool': () => 'bool',
    'int': () => 'int',
    'float': () => 'float',

    'oneOf': typedef =>
        `oneOf(${typedef.options.map(option => option.value).join(', ')})`,

    'array': () => 'array',
    'arrayOf': typedef => `arrayOf(${typeToString(typedef.ofType)})`,
    'object': () => 'object',

    'shape': typedef => {
        const structure = Object.keys(typedef.fields)
            .map(key => `${key}:${typeToString(typedef.fields[key])}`).join(',');

        return `shape(${structure})`
    },

    'component': () => 'component',
    'func': () => 'func',
};

const typeToString = typedef => typePrinters[typedef.type](typedef);

const readJSONFile = filename => co(function* () {
    let json;

    try {
        json = yield fs.readFile(filename, { encoding: 'utf8' });
    }
    catch (err) {
        if (err.code === 'ENOENT') return null;
        throw new Error(`FS error while reading ${filename}: ${err.code}`);
    }

    let data;

    try {
        data = JSON.parse(json);
    }
    catch (err) {
        throw new Error(`Malformed JSON in ${filename}`);
    }

    return data;
});

const metaValidationOptions = {
    validateFormats: true,
    validateFormatsStrict: true,
    validateFormatExtensions: true,
    additionalProperties: false,
    cast: false
};

const checkAdditionalPropTypeData = (propName, propMeta, strings, componentName = '') => {
    if (propMeta.textKey && !strings[propMeta.textKey]) {
        throw new Error(
            `Unknown string '${propMeta.textKey}' ` +
            `in textKey of prop '${propName}' ` +
            `of component '${componentName}'`
        );
    }

    if (propMeta.descriptionTextKey && !strings[propMeta.descriptionTextKey]) {
        throw new Error(
            `Unknown string '${propMeta.descriptionTextKey}' ` +
            `in descriptionKey of prop '${propName}' ` +
            `of component '${componentName}'`
        );
    }

    const hasDefaultValue =
        propMeta.source &&
        propMeta.source.indexOf('static') > -1 &&
        propMeta.sourceConfigs &&
        propMeta.sourceConfigs.static &&
        typeof propMeta.sourceConfigs.static.default !== 'undefined';

    const defaultValueIsInvalid =
        !!hasDefaultValue &&
        !isValidValue(propMeta.sourceConfigs.static.default, propMeta);

    if (defaultValueIsInvalid) {
        throw new Error(
            `'${componentName}': Default static value of prop '${propName}' ` +
            `is not valid for type '${typeToString(propMeta)}'`
        );
    }

    const hasConstValue =
        propMeta.source &&
        propMeta.source.indexOf('const') > -1 &&
        propMeta.sourceConfigs &&
        propMeta.sourceConfigs.const &&
        typeof propMeta.sourceConfigs.const.value !== 'undefined';

    const constValueIsInvalid =
        !!hasConstValue &&
        !isValidValue(propMeta.sourceConfigs.const.value, propMeta);

    if (constValueIsInvalid) {
        throw new Error(
            `'${componentName}': Const value of prop '${propName}' ` +
            `is not valid for type '${typeToString(propMeta)}'`
        );
    }

    if (propMeta.type === 'oneOf') {
        if (typeof propMeta.options === 'undefined') {
            throw new Error(
                `'${componentName}': Prop '${propName}' ` +
                `of type 'oneOf' must have 'options' field`
            );
        }

        for (let i = 0, l = propMeta.options.length; i < l; i++) {
            const optionTextKey = propMeta.options[i].textKey;

            if (!strings[optionTextKey]) {
                throw new Error(
                    `Unknown string '${optionTextKey}' ` +
                    `in options list of prop '${propName}' ` +
                    `of component '${componentName}'`
                );
            }
        }
    }
    else if (propMeta.type === 'arrayOf') {
        if (typeof propMeta.ofType === 'undefined')
            throw new Error(
                `'${componentName}': Prop '${propName}' ` +
                `of type 'arrayOf' must have 'ofType' field`
            );

        checkAdditionalPropTypeData(
            propName + '.[]',
            propMeta.ofType,
            strings,
            componentName
        );
    }
    else if (propMeta.type === 'shape') {
        if (typeof propMeta.fields === 'undefined')
            throw new Error(
                `'${componentName}': Prop '${propName}' ` +
                `of type 'shape' must have 'fields' field`
            );

        const fields = Object.keys(propMeta.fields);

        for (let i = 0, l = fields.length; i < l; i++)
            checkAdditionalPropTypeData(
                propName + '.' + fields[i],
                propMeta.fields[fields[i]],
                strings,
                componentName
            );
    }
    else if (propMeta.type === 'string') {
        const hasDefaultTextKey =
            propMeta.source &&
            propMeta.source.indexOf('static') > -1 &&
            propMeta.sourceConfigs.static &&
            propMeta.sourceConfigs.static.defaultTextKey;

        if (hasDefaultTextKey) {
            const defaultTextKey = propMeta.sourceConfigs.static.defaultTextKey;

            if (!strings[defaultTextKey]) {
                throw new Error(
                    `Unknown string '${defaultTextKey}' ` +
                    `in defaultTextKey of prop '${propName}' ` +
                    `of component '${componentName}'`
                );
            }
        }
    }
};

const checkAdditionalTypedefTypeData = (typeName, typedef, strings) => {
    if (typedef.type === 'oneOf') {
        if (typeof typedef.options === 'undefined')
            throw new Error(
                `Type '${typeName}' (oneOf) must have 'options' field`
            );

        for (let i = 0, l = typedef.options.length; i < l; i++) {
            const optionTextKey = typedef.options[i].textKey;

            if (!strings[optionTextKey])
                throw new Error(
                    `Unknown string '${optionTextKey}' ` +
                    `in options list of type '${typeName}'`
                );
        }
    }

    if (typedef.type === 'arrayOf') {
        if (typeof typedef.ofType === 'undefined')
            throw new Error(
                `Type '${typeName}' (arrayOf) must have 'ofType' field`
            );

        checkAdditionalPropTypeData('[]', typedef.ofType, strings);
    }

    if (typedef.type === 'shape') {
        if (typeof typedef.fields === 'undefined')
            throw new Error(
                `Type '${typeName}' (shape) must have 'fields' field`
            );

        const fields = Object.keys(typedef.fields);

        for (let i = 0, l = fields.length; i < l; i++)
            checkAdditionalPropTypeData(fields[i], typedef.fields[fields[i]], strings);
    }
};

const readTypedefs = (metaDir, strings) => co(function* () {
    const typesFile = path.join(metaDir, constants.METADATA_TYPES_FILE),
        types = yield readJSONFile(typesFile);

    if (!types) return null;

    let validationResult;

    try {
        validationResult = rv.validate(types, typesSchema);
    }
    catch(err) {
        throw new Error(
            `Error while performing formal validation of file ${typesFile}`
        );
    }

    const { valid, errors } = validationResult;

    if (!valid) {
        const err = new Error(`Invalid typedefs in ${typesFile}`);
        err.validationErrors = errors;
        throw err;
    }

    const typeNames = Object.keys(types);

    for (let j = 0, m = typeNames.length; j < m; j++)
        checkAdditionalTypedefTypeData(typeNames[j], types[typeNames[j]], strings);

    return types;
});

const readStrings = metaDir => co(function* () {
    const stringsFile = path.join(metaDir, constants.METADATA_STRINGS_FILE),
        strings = yield readJSONFile(stringsFile);

    if (!strings) return null;

    let validationResult;

    try {
        validationResult = rv.validate(strings, stringsSchema);
    }
    catch(err) {
        throw new Error(
            `Error while performing formal validation of file ${stringsFile}`
        );
    }

    const { valid, errors } = validationResult;

    if (!valid) {
        const err = new Error(`Invalid strings in ${stringsFile}`);
        err.validationErrors = errors;
        throw err;
    }

    return strings;
});

const readComponentMeta = metaDir => co(function* () {
    const metaFile = path.join(metaDir, constants.METADATA_FILE),
        meta = yield readJSONFile(metaFile);

    let validationResult;

    try {
        validationResult = rv.validate(meta, metaSchema, metaValidationOptions);
    }
    catch(err) {
        throw new Error(
            `Error while performing formal validation of file ${metaFile}`
        );
    }

    const { valid, errors } = validationResult;

    if (!valid) {
        const err = new Error(`Invalid metadata in ${metaFile}`);
        err.validationErrors = errors;
        throw err;
    }

    if (!meta.strings) meta.strings = (yield readStrings(metaDir)) || {};
    if (!meta.props) meta.props = {};
    if (!meta.propGroups) meta.propGroups = [];

    for (let i = 0, l = meta.propGroups.length; i < l; i++) {
        if (!meta.strings[meta.propGroups[i].textKey]) {
            throw new Error(
                `Unknown string '${meta.propGroups[i].textKey}' ` +
                `in prop groups list of component '${meta.displayName}'`
            );
        }
    }

    const props = Object.keys(meta.props);

    for (let i = 0, l = props.length; i < l; i++) {
        const propMeta = meta.props[props[i]];

        const groupIsOk =
            !propMeta.group ||
            meta.propGroups.some(group => group.name === propMeta.group);

        if (!groupIsOk) {
            throw new Error(
                `Unknown props group '${propMeta.group}' ` +
                `in prop '${props[i]}' ` +
                `of component '${meta.displayName}'`
            );
        }

        if (internalTypes.has(propMeta.type)) {
            checkAdditionalPropTypeData(
                props[i],
                propMeta,
                meta.strings,
                meta.displayName
            );
        }
        else {
            if (!meta.types)
                meta.types = (yield readTypedefs(metaDir, meta.strings)) || {};

            if (typeof meta.types[propMeta.type] === 'undefined') {
                throw new Error(
                    `Unknown type '${propMeta.type}' ` +
                    `in prop ${props[i]} ` +
                    `of component ${meta.displayName}`
                );
            }
        }
    }

    if (meta.kind === 'composite') {
        if (!meta.layouts) {
            throw new Error(
                `'layouts' field not found in metadata ` +
                `for composite component '${meta.displayName}'`
            );
        }

        for (let i = 0, l = meta.layouts.length; i < l; i++) {
            const layout = meta.layouts[i];
            if (layout.textKey && !meta.strings[layout.textKey]) {
                throw new Error(
                    `Unknown string '${layout.textKey}' ` +
                    `in layouts of component '${meta.displayName}'`
                );
            }

            if (layout.descriptionTextKey && !meta.strings[layout.descriptionTextKey]) {
                throw new Error(
                    `Unknown string '${layout.descriptionTextKey}' ` +
                    `in layouts of component '${meta.displayName}'`
                );
            }

            const regions = layout.regions;
            for (let j = 0, m = regions.length; j < m; j++) {
                if (!meta.strings[regions[j].textKey]) {
                    throw new Error(
                        `Unknown string '${regions[j].textKey}' ` +
                        `in layouts of component '${meta.displayName}'`
                    );
                }

                if (!meta.strings[regions[j].descriptionTextKey]) {
                    throw new Error(
                        `Unknown string '${regions[j].descriptionTextKey}' ` +
                        `in layouts of component '${meta.displayName}'`
                    );
                }
            }
        }
    }

    return meta;
});

const isDirectory = dir => co(function* () {
    let stats;
    try {
        stats = yield fs.stat(dir);
    }
    catch (err) {
        if (err.code === 'ENOENT') return false;
        throw err;
    }

    return stats.isDirectory();
});

const visitNode = ({ dir }) => co(function* () {
    const jssyMetaDir = path.join(dir, constants.METADATA_DIR);

    return (yield isDirectory(jssyMetaDir))
        ? (yield readComponentMeta(jssyMetaDir))
        : null;
});

const getChildNodes = ({ dir }) => co(function* () {
    const contents = yield fs.readdir(dir),
        ret = [];

    for (let i = 0, l = contents.length; i < l; i++) {
        if (contents[i] === constants.METADATA_DIR) continue;
        const fullPath = path.join(dir, contents[i]);
        if (yield isDirectory(fullPath)) ret.push({ dir: fullPath });
    }

    return ret;
});

/**
 * @typedef {Object} LibMetadata
 * @property {string} namespace
 * @property {boolean} globalStyle
 * @property {string[]} import
 * @property {Object.<string, string[]>} loaders
 * @property {Object.<string, Object>} components
 * @property {Object} packageJSON
 */

/**
 *
 * @param {string} moduleDir
 * @returns {Promise.<LibMetadata>}
 */
exports.gatherMetadata = moduleDir => co(function* () {
    let ret = {},
        mainMeta = null;

    const mainMetaFile = path.join(moduleDir, constants.METADATA_MAIN_FILE);
    mainMeta = yield readJSONFile(mainMetaFile);

    if (!mainMeta) {
        const packageJSON = require(path.join(moduleDir, 'package.json'));
        mainMeta = packageJSON.jssy;
    }

    if (!mainMeta)
        throw new Error('Not a jssy components library');

    const { valid, errors } = rv.validate(mainMeta, mainMetaSchema);

    if (!valid) {
        const err = new Error(`Invalid main metadata`);
        err.validationErrors = errors;
        throw err;
    }

    ret = Object.assign(ret, mainMeta);

    if (!ret.components) {
        ret.components = {};

        const walker = new AsyncTreeWalker([{ dir: moduleDir }], getChildNodes);
        let node;

        while (node = yield walker.next()) {
            try {
                const maybeMeta = yield visitNode(node);

                if (maybeMeta !== null) {
                    if (maybeMeta.group && !mainMeta.componentGroups[maybeMeta.group]) {
                        //noinspection ExceptionCaughtLocallyJS
                        throw new Error(
                            `'${maybeMeta.displayName}' component: ` +
                            `group '${maybeMeta.group}' is not defined.`
                        );
                    }

                    maybeMeta.tags = new Set(maybeMeta.tags || []);

                    ret.components[maybeMeta.displayName] = maybeMeta;
                }
            }
            catch (err) {
                err.message =
                    `Error while reading components metadata of '${ret.namespace}': ` +
                    err.message || err.toString();

                throw err;
            }
        }
    }

    if (ret.tags) {
        Object.keys(ret.tags).forEach(tag => {
            ret.tags[tag].forEach(componentName => {
                if (!ret.components[componentName]) {
                    throw new Error(
                        `Unknown component '${componentName}' ` +
                        `in tags section (tag '${tag}') of jssy.json`
                    );
                }

                ret.components[componentName].tags.add(tag);
            });
        });
    }

    return ret;
});
