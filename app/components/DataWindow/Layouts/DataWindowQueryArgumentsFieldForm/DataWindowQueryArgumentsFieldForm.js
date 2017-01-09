'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';

import { Prop } from '../../../PropsList/PropsList';

import {
  isPrimitiveGraphQLType,
  FIELD_KINDS,
} from '../../../../utils/schema';

const DEFAULT_VALUE_NON_NULL_PRIMITIVE
  = Symbol('DEFAULT_VALUE_NON_NULL_PRIMITIVE');


/**
 * @param {Object} object
 * @param {any} value
 * @param {Array<string|number>} path
 * @return {Object}
 */
const setObjectValueByPath = (object, value, path) => {
  if (!Array.isArray(object)) {
    return {
      ...object,
      [path[0]]:
        path.length === 1
          ? value
          : setObjectValueByPath(object[path[0]], value, path.slice(1)),

    };
  } else {
    const newObj = [...object];
    const index = path[0] + 1
      ? path[0]
      : newObj.push({}) - 1;

    const currentValue = path.length === 1
      ? value
      : setObjectValueByPath(newObj[index], value, path.slice(1));

    newObj[index] = currentValue;

    return newObj;
  }
};

/**
 * @param {Object} object
 * @param {Array<string|number>} path
 * @return {any}
 */
const getObjectValueByPath = (object, path) =>
  path.length === 1
    ? object[path[0]]
    : getObjectValueByPath(object[path[0]], path.slice(1));

/**
 * @param {Object} object
 * @param {Array<string|number>} path
 * @return {Object}
 */
const removeObjectValueByPath = (object, path) => {
  if (Array.isArray(object)) {
    if (path.length === 1) {
      return object.slice(0, path[0]).concat(object.slice(path[0] + 1));
    } else {
      return object.slice(0, path[0]).concat([
        removeObjectValueByPath(object[path[0]], path.slice(1)),
      ]).concat(object.slice(path[0] + 1));
    }
  } else if (path.length === 1) {
    const newObj = { ...object };
    delete newObj[path[0]];
    return newObj;
  } else {
    return {
      ...object,
      [path[0]]:
            removeObjectValueByPath(object[path[0]], path.slice(1)),
    };
  }
};

const parseIntValue = value => {
  const parsedValue = parseInt(value, 10);
  return `${
    Number.isSafeInteger(parsedValue) ? parsedValue : 0
  }`;
};

const parseFloatValue = value => {
  const parsedValue = parseFloat(value);

  const matchedDecimal = value.match(/\.\d*/);

  const fixBy =
    matchedDecimal
    && matchedDecimal[0]
    && matchedDecimal[0].length - 1;

  const fixedValue =
    !(parsedValue % 1)
      ? parsedValue.toFixed(fixBy + 1 ? fixBy : 0)
      : `${parsedValue}`;

  const valueEndsWithPoint =
    value.endsWith('.') && value.match(/\./g).length === 1
      ? `${parsedValue}.`
      : fixedValue;

  return isFinite(parsedValue)
    ? valueEndsWithPoint
    : '0.0';
};

const getTransformFunction = typeName => (
    {
      Int: parseIntValue,
      Float: parseFloatValue,
    }[typeName]
);


const getDefaultArgFieldValue = (type, kind) => {
  let defaultValue;

  if (!isPrimitiveGraphQLType(type))
    defaultValue = {};
  else if (type === 'Boolean')
    defaultValue = false;
  else if (type === 'String' || type === 'ID')
    defaultValue = '';
  else if (type === 'Int' || type === 'Float')
    defaultValue = 0;

  if (kind === FIELD_KINDS.LIST) return [defaultValue];
  else return defaultValue;
};

export class DataWindowQueryArgumentsFieldForm extends PureComponent {
  static createValueAndPropTypeTree(
    argField,
    argFieldName,
    argFieldConstValue,
    types,
  ) {
    const isComposite = argField.kind === FIELD_KINDS.LIST;
    let argFieldValue,
      ofType = void 0;

    if (typeof argFieldConstValue === 'undefined')
      argFieldValue = {};
    else if (argFieldConstValue === null)
      argFieldValue = null;
    else
      argFieldValue = { ...argFieldConstValue };

    if (isComposite && typeof argFieldValue[argFieldName] === 'undefined')
      argFieldValue[argFieldName] = [void 0];

    if (typeof argFieldValue[argFieldName] === 'undefined') {
      argFieldValue[argFieldName] = null;
    } else if (
        argFieldValue[argFieldName] === DEFAULT_VALUE_NON_NULL_PRIMITIVE
      ) {
      argFieldValue[argFieldName] = getDefaultArgFieldValue(
        argField.type,
        argField.kind,
      );
    }

    const subFields =
        !isPrimitiveGraphQLType(argField.type)
        && !isComposite
        && argFieldValue !== null
        ? Object.keys(types[argField.type].fields)
            .reduce((acc, fieldName) => {
              const field = types[argField.type].fields[fieldName];

              const {
                        fieldValue,
                        propType,
                    } = DataWindowQueryArgumentsFieldForm
                          .createValueAndPropTypeTree(
                        field,
                        fieldName,
                        argFieldValue[argFieldName],
                        types,
                    );

              if (argFieldValue[argFieldName])
                argFieldValue[argFieldName][fieldName] = fieldValue;

              return Object.assign(acc, {
                [fieldName]: propType,
              });
            }
                , {})
            : {};

    if (isComposite) {
      ofType = argFieldValue[argFieldName]
                .map(value =>
                    DataWindowQueryArgumentsFieldForm
                        .createValueAndPropTypeTree(
                            Object.assign(
                                {}, argField, { kind: FIELD_KINDS.SINGLE },
                            ), argFieldName, { [argFieldName]: value }, types,
                        ),
                );
      argFieldValue[argFieldName] = ofType.map(
                ({ fieldValue }) => fieldValue,
            );
    }

    const notNull =
            !isComposite && typeof argField.nonNullMember === 'boolean'
            ? argField.nonNullMember
            : argField.nonNull;

    const primitiveTypeView =
          argField.type === 'Boolean'
          ? 'select'
          : 'input';

    const singleTypeView =
          isPrimitiveGraphQLType(argField.type)
          ? primitiveTypeView
          : 'shape';

    return {
      fieldValue:
                 argFieldValue
                && argFieldValue[argFieldName],
      propType: {
        label: argFieldName,
        view:
              argField.kind === FIELD_KINDS.LIST
                   ? 'array'
                   : singleTypeView,
        type: argField.type,
        transformValue: getTransformFunction(
                     argField.type,
               ),
        required: !!notNull,
        displayRequired: !!notNull,
        notNull: !!notNull,
        fields: subFields,
        ofType: ofType && ofType[0] && ofType[0].propType,
      },
    };
  }

  constructor(props) {
    super(props);
    this.state = this._convertValueAndPropTypeTreeToState(
            props.argField,
            props.argFieldName,
            props.argFieldValue,
            props.types,
        );
    props.setNewArgumentValue(
            this.state.fieldValue,
        );
    this._handleChange = this._handleChange.bind(this);
    this._handleNullSwitch = this._handleNullSwitch.bind(this);
    this._convertObjectToValue = this._convertObjectToValue.bind(this);
    this._handleAdd = this._handleAdd.bind(this);
    this._handleRemove = this._handleRemove.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {
            fieldValue,
            propType,
        } = DataWindowQueryArgumentsFieldForm.createValueAndPropTypeTree(
            nextProps.argField,
            nextProps.argFieldName,
            nextProps.argFieldValue,
            nextProps.types,
        );

    this.setState(
      {
        fieldValue: {
          [nextProps.argFieldName]: fieldValue,
        },
        propType,
      },
        );

    nextProps.setNewArgumentValue({
      [nextProps.argFieldName]: fieldValue,
    });
  }

  _convertValueAndPropTypeTreeToState(...args) {
    const {
            fieldValue,
            propType,
        } = DataWindowQueryArgumentsFieldForm.createValueAndPropTypeTree(
            ...args,
        );

    return ({
      fieldValue: {
        [args[1]]: fieldValue,
      },
      propType,
    });
  }

  _convertObjectToValue(obj) {
    return {
      value: (// eslint-disable-next-line
                typeof obj === 'object' && obj !== null
                ? !Array.isArray(obj)
                    ? Object.keys(obj).reduce(
                            (acc, name) => ({
                              ...acc,
                              [name]: this._convertObjectToValue(obj[name]),
                            })
                        , {})
                    : obj.map(this._convertObjectToValue)
                : obj === null
                     ? obj
                     : `${obj}`
            ),

      message: (
                this.props.argumentsBound
                        ? 'Arguments already in use'
                        : void 0
            ),
    };
  }

  _handleChange({ value, path }) {
    const newValue = setObjectValueByPath(
      this.state.fieldValue,
      value,
      [this.props.argFieldName].concat(path),
    );
    const {
      fieldValue,
      propType,
    } = this._convertValueAndPropTypeTreeToState(
      this.props.argField,
      this.props.argFieldName,
      newValue,
      this.props.types,
    );

    this.setState({ fieldValue, propType });

    this.props.setNewArgumentValue(
            fieldValue,
        );
  }

  _handleAdd(path, index) {
    this._handleChange(void 0, path.concat([index]));
  }

  _handleRemove(path, index) {
    const newValue = removeObjectValueByPath(
      this.state.fieldValue,
      [this.props.argFieldName].concat(path.concat([index])),
    );

    const {
      fieldValue,
      propType,
    } = this._convertValueAndPropTypeTreeToState(
      this.props.argField,
      this.props.argFieldName,
      newValue,
      this.props.types,
    );

    this.setState({ fieldValue, propType });

    this.props.setNewArgumentValue(
      fieldValue,
    );
  }

  _handleNullSwitch({ checked, path }) {
    const newValue = setObjectValueByPath(
      this.state.fieldValue,
      checked
      ? DEFAULT_VALUE_NON_NULL_PRIMITIVE
      : null,
      [this.props.argFieldName].concat(path),
    );

    const {
      fieldValue,
      propType,
    } = this._convertValueAndPropTypeTreeToState(
      this.props.argField,
      this.props.argFieldName,
      newValue,
      this.props.types,
    );

    this.setState({ fieldValue, propType });

    this.props.setNewArgumentValue(fieldValue);
  }

  render() {
    const { argFieldName } = this.props;
    const { fieldValue, propType } = this.state;
    const currentFieldValue = fieldValue[argFieldName];

    return (
      <Prop
        key={argFieldName}
        propType={propType}
        value={this._convertObjectToValue(currentFieldValue)}
        checkable
        onChange={this._handleChange}
        onCheck={this._handleNullSwitch}
        onAddValue={this._handleAdd}
        onDeleteValue={this._handleRemove}
      />
    );
  }
}

DataWindowQueryArgumentsFieldForm.propTypes = {
  argField: PropTypes.object.isRequired,
  argFieldName: PropTypes.string.isRequired,
  argFieldValue: PropTypes.any.isRequired,
  setNewArgumentValue: PropTypes.func.isRequired,
  argumentsBound: PropTypes.bool.isRequired,
  types: PropTypes.object.isRequired,
};
