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
    'int',
    'float',
    'bool',
    'object',
    'oneOf',
    'func',
    'component',
    'shape',
    'arrayOf'
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
                    'actions',
                    'interpolations'
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

        kind: {
            type: 'string',
            enum: ['atomic', 'container'],
            required: true
        },

        props: {
            type: 'object',
            patternProperties: {
                '.*': propSchema
            },
            required: true
        },

        types: Object.assign({ required: false }, typesSchema),

        strings: Object.assign({ required: false }, stringsSchema)
    }
};

const packageJSONMetaSchema = {
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
            type: 'array',
            required: false,
            uniqueItems: true,
            items: {
                type: 'string',
                allowEmpty: false
            }
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
        }
    }
};

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

const checkAdditionalPropTypeData = (propName, propMeta, strings) => {
    if (propMeta.textKey && !strings[propMeta.textKey])
        throw new Error(
            `Unknown string '${propMeta.textKey}' ` +
            `in textKey of prop ${propName}`
        );

    if (propMeta.descriptionTextKey && !strings[propMeta.descriptionTextKey])
        throw new Error(
            `Unknown string '${propMeta.descriptionTextKey}' ` +
            `in descriptionKey of prop ${propName}`
        );

    if (propMeta.type === 'oneOf') {
        if (typeof propMeta.options === 'undefined') {
            throw new Error(
                `Prop ${propName} of type 'oneOf' must have 'options' field`
            );
        }

        for (let i = 0, l = propMeta.options.length; i < l; i++) {
            const optionTextKey = propMeta.options[i].textKey;

            if (!strings[optionTextKey])
                throw new Error(
                    `Unknown string '${optionTextKey}' ` +
                    `in options list of prop ${propName}`
                );
        }
    }

    if (propMeta.type === 'arrayOf') {
        if (typeof propMeta.ofType === 'undefined')
            throw new Error(
                `Prop ${propName} of type 'arrayOf' must have 'ofType' field`
            );

        checkAdditionalPropTypeData(propName + '.[]', propMeta.ofType, strings);
    }

    if (propMeta.type === 'shape') {
        if (typeof propMeta.fields === 'undefined')
            throw new Error(
                `Prop ${propName} of type 'shape' must have 'fields' field`
            );

        const fields = Object.keys(propMeta.fields);

        for (let i = 0, l = fields.length; i < l; i++)
            checkAdditionalPropTypeData(
                propName + '.' + fields[i],
                propMeta.fields[fields[i]],
                strings
            );
    }
};

const checkAdditionalTypedefTypeData = (typeName, typedef, strings) => {
    if (typedef.type === 'oneOf') {
        if (typeof typedef.options === 'undefined')
            throw new Error(
                `Type ${typeName} (oneOf) must have 'options' field`
            );

        for (let i = 0, l = typedef.options.length; i < l; i++) {
            const optionTextKey = typedef.options[i].textKey;

            if (!strings[optionTextKey])
                throw new Error(
                    `Unknown string '${optionTextKey}' ` +
                    `in options list of type ${typeName}`
                );
        }
    }

    if (typedef.type === 'arrayOf') {
        if (typeof typedef.ofType === 'undefined')
            throw new Error(
                `Type ${typeName} (arrayOf) must have 'ofType' field`
            );

        checkAdditionalPropTypeData('[]', typedef.ofType, strings);
    }

    if (typedef.type === 'shape') {
        if (typeof typedef.fields === 'undefined')
            throw new Error(
                `Type ${typeName} (shape) must have 'fields' field`
            );

        const fields = Object.keys(typedef.fields);

        for (let i = 0, l = fields.length; i < l; i++)
            checkAdditionalPropTypeData(fields[i], typedef.fields[fields[i]], strings);
    }
};

const readTypedefs = (metaDir, strings) => co(function* () {
    const typesFile = path.join(metaDir, constants.METADATA_TYPES_FILE),
        types = yield readJSONFile(typesFile);

    const { valid, errors } = rv.validate(types, typesSchema);

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

    const { valid, errors } = rv.validate(strings, stringsSchema);

    if (!valid) {
        const err = new Error(`Invalid strings in ${stringsFile}`);
        err.validationErrors = errors;
        throw err;
    }

    return strings;
});

const readComponentMeta = metaDir => co(function* () {
    const metaFile = path.join(metaDir, constants.METADATA_FILE),
        meta = yield readJSONFile(metaFile),
        { valid, errors } = rv.validate(meta, metaSchema, metaValidationOptions);

    if (!valid) {
        const err = new Error(`Invalid metadata in ${metaFile}`);
        err.validationErrors = errors;
        throw err;
    }

    const props = Object.keys(meta.props);

    if (!meta.strings) meta.strings = (yield readStrings(metaDir)) || {};

    for (let i = 0, l = props.length; i < l; i++) {
        const propMeta = meta.props[props[i]];

        if (internalTypes.has(propMeta.type)) {
            checkAdditionalPropTypeData(props[i], propMeta, meta.strings);
        }
        else {
            if (!meta.types)
                meta.types = (yield readTypedefs(metaDir, meta.strings)) || {};

            if (typeof meta.types[propMeta.type] === 'undefined')
                throw new Error(`Type ${propMeta.type} is not defined`);
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

exports.gatherMetadata = moduleDir => co(function* () {
    let ret = {};

    const packageJSON = require(path.join(moduleDir, 'package.json'));

    if (!packageJSON.jssy)
        throw new Error('Not a jssy components library');

    const { valid, errors } = rv.validate(packageJSON.jssy, packageJSONMetaSchema);

    if (!valid) {
        const err = new Error(`Invalid metadata in package.json`);
        err.validationErrors = errors;
        throw err;
    }

    ret = Object.assign(ret, packageJSON.jssy);

    if (!ret.components) {
        ret.components = {};

        const walker = new AsyncTreeWalker([{ dir: moduleDir }], getChildNodes);
        let node;

        while (node = yield walker.next()) {
            const maybeMeta = yield visitNode(node);
            if (maybeMeta !== null) ret.components[maybeMeta.displayName] = maybeMeta;
        }
    }

    return ret;
});
