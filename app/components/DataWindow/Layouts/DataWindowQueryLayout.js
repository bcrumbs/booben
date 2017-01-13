/* eslint-disable */
'use strict';

// TODO: Delete this file after refactoring

import React from 'react';

import {
    DataWindowDataLayout,
} from './DataWindowDataLayout';

import {
    DataWindowContentGroup,
} from '../DataWindowContent/DataWindowContent';

import {
    DataWindowQueryArgumentsFieldForm,
} from './DataWindowQueryArgumentsFieldForm/DataWindowQueryArgumentsFieldForm';

import {
    PropsList,
} from '../../PropsList/PropsList';

import {
    isPrimitiveGraphQLType,
    equalMetaToGraphQLTypeNames,
    FIELD_KINDS,
} from '../../../utils/schema';

import {
    clone,
    objectFilter,
} from '../../../utils/misc';

import {
    getComponentMeta,
    getPropTypedef,
    getNestedTypedef,
} from '../../../utils/meta';

const canBeApplied = (metaType, graphQLType) => {
  // TODO make equality check deeper? or not? or ...?
  const isGraphQLTypeList =
    graphQLType.kind === FIELD_KINDS.CONNECTION
    || graphQLType.kind === FIELD_KINDS.LIST;

  if (metaType.type === 'arrayOf') {
    if (metaType.ofType.type === 'object')
      return isGraphQLTypeList && !isPrimitiveGraphQLType(graphQLType.type);
    else if (
            isGraphQLTypeList
                  &&
                  equalMetaToGraphQLTypeNames(
                    metaType.ofType.type, graphQLType.type,
                  )
              ) return true;
  } else if (
            graphQLType.kind === FIELD_KINDS.SINGLE
            && (
              metaType.type === 'oneOf'
              && metaType.ofType.options.some(
                  option => equalMetaToGraphQLTypeNames(
                              option.type, graphQLType.type,
                            ),
              )
                  || equalMetaToGraphQLTypeNames(
                      metaType.type, graphQLType.type,
                     )
            )
         ) { return true; }
  return false;
};

const showField = (metaType, graphQLType) =>
    canBeApplied(metaType, graphQLType)
        || (
            !isPrimitiveGraphQLType(graphQLType.type)
            && graphQLType.kind === FIELD_KINDS.SINGLE
        );

const canGoIntoField = (metaType, graphQLType) =>
    graphQLType.kind === FIELD_KINDS.SINGLE
        && !isPrimitiveGraphQLType(graphQLType.type);

export class DataWindowQueryLayout extends DataWindowDataLayout {
  static equalFieldPaths(path1, path2) {
    if (!path1 || !path2) return false;
    return ['name', 'type', 'kind'].every(
            name => path1[name] === path2[name],
        );
  }

  static haveArguments(field) {
    return !!(field && field.args && Object.keys(field.args).length);
  }

  static setNewArgumentValue(argValue, value) {
    Object.assign(argValue, value);
  }

  constructor(props) {
    super(props);
    const { queryTypeName } = this.props.schema;
    this.state = {
      currentPath: [
                { displayName: 'data', name: 'Data' },
                { displayName: 'query', name: 'Query', type: queryTypeName },
      ],
      previousPath: [
      ],
      argumentsForCurrentPathLast: false,
      argumentsMode: false,
      allArgumentsMode: false,
      selectedFieldName: '',
    };
    this._handleJumpIntoField = this._handleJumpIntoField.bind(this);
    this._handleJumpToCurrentPathIndex =
            this._handleJumpToCurrentPathIndex.bind(this);
    this._handleFieldSelect = this._handleFieldSelect.bind(this);
    this._handleSetArgumentsPress = this._handleSetArgumentsPress.bind(this);
    this._handleDataApplyPress = this._handleDataApplyPress.bind(this);
    this._handleArgumentsApplyPress
          = this._handleArgumentsApplyPress.bind(this);
    this._handleBackToPress = this._handleBackToPress.bind(this);
    this._getCurrentEditingFields = this._getCurrentEditingFields.bind(this);
    this._getBoundArgumentsByPath = this._getBoundArgumentsByPath.bind(this);
    this._getSelectedField = this._getSelectedField.bind(this);
    this._areArgumentsBound = this._areArgumentsBound.bind(this);
    this._getFieldTypeName = this._getFieldTypeName.bind(this);
  }

  _handleJumpIntoField(name, type, kind, args, isCurrentPathLast = false) {
    const { previousPath, currentPath } = this.state;
    const isDataApplied = canBeApplied(this.currentPropType, { type, kind });

    const argsForField =
            args
            || this._getCurrentArguments(
                    isCurrentPathLast,
                    false,
                    name,
                ).slice(-1)[0]
            || {};

    this.setState({
      argumentsMode: isDataApplied,
      allArgumentsMode: isDataApplied,
      argumentsForCurrentPathLast: false,
      currentPath: [
        ...(
                    isCurrentPathLast
                    ? currentPath.slice(0, -1)
                    : currentPath
                ),
        {
          name,
          type,
          kind,
          args: argsForField,
        },
      ],
      previousPath:
                DataWindowQueryLayout.equalFieldPaths(
                    previousPath[currentPath.length],
                    { name, type, kind },
                ) || isCurrentPathLast
                ? previousPath
                : [],
    });
  }

  _handleJumpToCurrentPathIndex(index) {
    const lengthDiff =
            this.state.currentPath.length
            -
            this.state.previousPath.length;

    if (!index) {
      this.props.backToMainLayout();
      return;
    }

    if (index + 1 !== this.state.currentPath.length) {
      this.setState({
        currentPath: this.state.currentPath.slice(
                    0,
                    index + 1,
                ),
        previousPath:
                    this.state.currentPath.slice(0).concat(
                        lengthDiff < 0
                        ? this.state.previousPath.slice(lengthDiff)
                        : [],
                    ),
        selectedFieldName: '',
        argumentsMode: false,
        allArgumentsMode: false,
      });
    }
  }

  _getFieldTypeName(field) {
    switch (field.kind) {
      case FIELD_KINDS.CONNECTION:
        return this.props.getLocalizedText('connectionKind');
      case FIELD_KINDS.LIST:
        return this.props.getLocalizedText('listKind');
      default:
        return '';
    }
  }

  _handleFieldSelect(selectedFieldName) {
    if (selectedFieldName !== this.state.selectedFieldName)
      this.setState({ selectedFieldName });
  }

  _handleSetArgumentsPress(argumentsForCurrentPathLast) {
    this.setState({
      argumentsMode: true,
      argumentsForCurrentPathLast,
    });
  }

  _handleArgumentsApplyPress(args) {
    if (!this.state.allArgumentsMode) {
      const { name, kind, type } = this._getCurrentEditingFields()[0];
      this._handleJumpIntoField(
                name,
                type,
                kind,
                args[0],
                this.state.argumentsForCurrentPathLast,
            );
    } else {
      this._applyPropData(args);
    }
  }

  _applyPropData(args = []) {
    const queryPath = this._getCurrentEditingFields(true).concat(
                !this.state.allArgumentsMode
                && this._getSelectedField()
                ? [this._getSelectedField()]
                : [],
            ).map(pathStep => ({
              field: pathStep.name,
            }),
        );

    const queryArgs = args.reduce((acc, currentArg, num) =>
            Object.keys(currentArg).length
            ? {
              ...acc,
              '': {
                ...acc[''],
                [queryPath.slice(0, num + 1)
                        .map(({ field }) => field).join(' ')]:
                            DataWindowQueryLayout
                                .createSourceDataObject(currentArg),
              },
            }
            : acc
        , {});
    this.props.onUpdateComponentPropValue(
      this.props.linkingPropOfComponentId,
      this.props.linkingPropName,
      this.props.linkingPropPath,
      'data',
      {
        queryPath,
      },
      queryArgs,

    );
    this.props.onLinkPropCancel();
  }

  _handleDataApplyPress() {
    if (!this._getCurrentEditingFields(true).concat(
            this._getSelectedField()
            ? [this._getSelectedField()]
            : [],
        ).some(
            ({ args }) => Object.keys(args).length,
        )) {
      this._applyPropData();
    } else {
      this._handleJumpIntoField(
          this._getSelectedField().name,
          this._getSelectedField().type,
          this._getSelectedField().kind,
          void 0,
      );
    }
  }

  _handleBackToPress() {
    const argumentsMode = false;
    if (this.state.argumentsMode) {
      if (this.state.allArgumentsMode) {
        this._handleJumpToCurrentPathIndex(
                    this.state.currentPath.length - 2,
                );
      } else {
        this.setState({
          argumentsMode,
          allArgumentsMode:
                        this.state.argumentsForCurrentPathLast
                        && argumentsMode,
          argumentsForCurrentPathLast:
                        this.state.argumentsForCurrentPathLast
                        && argumentsMode,
        });
      }
    } else {
      this._handleJumpToCurrentPathIndex(this.state.currentPath.length - 2);
    }
  }


  _getCurrentPathByIndex(index) {
    return this.state.currentPath.slice(index)[0];
  }

  get currentSelectionPath() {
    return this.state.currentPath.slice(2);
  }

  get breadcrumbs() {
    return this.state.currentPath.map(
            ({ name, displayName }) => ({
              title: typeof displayName === 'undefined'
                    ? name
                    : this.props.getLocalizedText(displayName),
            }),
        );
  }

  _getSelectedField(fieldName = this.state.selectedFieldName) {
    const { types } = this.props.schema;
    const currentPathLast = this._getCurrentPathByIndex(-1);
    if (!isPrimitiveGraphQLType(currentPathLast.type)) {
      const isSelectedFieldConnectionField
                = fieldName.includes('/');
      if (isSelectedFieldConnectionField) {
        const compositeFieldName = fieldName.split('/');
        return Object.assign({}, types[currentPathLast.type].fields[
                    compositeFieldName[0]
                ].connectionFields[compositeFieldName[1]], { name: fieldName });
      }
      return types[currentPathLast.type].fields[fieldName];
    } else {
      return types[this._getCurrentPathByIndex(-2).type]
                            .fields[currentPathLast.name];
    }
  }

  _getCurrentArguments(
    lastPath,
    allArgumentsMode,
    fieldName = this.state.selectedFieldName,
    ) {
    const previousPathField =
            this.state.previousPath[this.state.currentPath.length];

    const boundArguments = !allArgumentsMode && this._getBoundArgumentsByPath(
            !lastPath
            ? this.currentSelectionPath
                    .concat(
                        this._getSelectedField(fieldName)
                        ? [this._getSelectedField(fieldName)]
                        : [],
                    )
            : this.currentSelectionPath,
        );

    return allArgumentsMode
            ? this.currentSelectionPath.map(
                    ({ args }) =>
                        args,
                )
            : [
              !lastPath
                ?
                    previousPathField
                    && DataWindowQueryLayout.equalFieldPaths(
                        previousPathField,
                        this.props.schema.types[
                          this._getCurrentPathByIndex(-1).type
                        ].fields[fieldName],
                    )
                    && previousPathField.args
                    || boundArguments
                    || {}
                : this._getCurrentPathByIndex(-1).args || boundArguments,
            ];
  }

  _getCurrentEditingFields(allCurrentPathFields) {
    const { types } = this.props.schema;
    // TODO refactor
    /* eslint-disable */
    return this.currentSelectionPath.length
            ? this.state.allArgumentsMode || allCurrentPathFields
                ? this.currentSelectionPath.reduce((path, { name }) => {
                  const parentField = types[
                            path.length
                            ? path[path.length - 1].type
                            : this._getCurrentPathByIndex(
                                -1 - this.currentSelectionPath.length,
                            ).type
                        ];

                  const fieldConnections
                        = objectFilter(parentField.fields,
                            ({ kind }) => kind === FIELD_KINDS.CONNECTION,
                        );

                  return path.concat(
                      parentField.fields[name]
                      || {
                        ...Object.keys(fieldConnections).reduce(
                          (_, fieldConnectionName) =>
                              _ || fieldConnections[fieldConnectionName]
                                      .connectionFields[name.split('/')[1]]
                          , void 0),
                        name,
                      },
                  );
                }
                    , [])
                :
            [
              this.state.argumentsMode
                        && !this.state.argumentsForCurrentPathLast
                        ? types[this._getCurrentPathByIndex(-1).type]
                                    .fields[this.state.selectedFieldName]
                        : types[this._getCurrentPathByIndex(-2).type]
                               .fields[this._getCurrentPathByIndex(-1).name],
            ]
            : !this.currentSelectionPath.length
                && !this.state.argumentsForCurrentPathLast
                && this.state.argumentsMode
                ? [types[
                        this._getCurrentPathByIndex(-1).type
                    ].fields[this.state.selectedFieldName]]
                : [];
    /*eslint-enable*/
  }

  static extractSourceDataValue({ sourceData }) {
    const { value } = sourceData;
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return (
          value.map(
              DataWindowQueryLayout.extractSourceDataValue,
          )
        );
      } else {
        return (
          Object.keys(
              value,
          ).reduce((acc, objName) =>
              Object.assign(
                  acc,
                {
                  [objName]: DataWindowQueryLayout.extractSourceDataValue(
                          value[objName],
                      ),
                },
              )
          , {})
        );
      }
    } else { return value; }
  }

  static createSourceDataObject(obj) {
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        return obj.map(value => ({
          source: 'static',
          sourceData: {
            value:
                DataWindowQueryLayout
                    .createSourceDataObject(
                        value,
                    ),
          },
        }),
        );
      } else {
        return Object.keys(obj).reduce((acc, key) =>
                ({
                  ...acc,
                  [key]: {
                    source: 'static',
                    sourceData: {
                      value:
                        DataWindowQueryLayout
                            .createSourceDataObject(
                                obj[key],
                      ),
                    },
                  },
                })
          , {});
      }
    } else { return obj; }
  }

    /**
     * @param {Array<Object>} fields
     * @param {Array<Object>} fieldsArgsValues
     * @param {Array<boolean>} areArgumentsBound
     * @param {bool} allArgumentsMode
     * @param {string} backToFieldName
     * @param {Object<Object>} types
     * @param {Function} haveArguments
     * @param {Function} createContentArgumentField
     * @param {Function} setNewArgumentValue
     * @param {Function} handleJumpIntoField
     * @param {Function} handleBackToPress
     * @param {Function} handleApplyPress
     * @param {Function} getLocalizedText
     * @param {string=} title
     * @param {string=} subtitle
     * @param {string=} description
     * @return {Object}
     *
     */
  createContentArgumentsType(
    fields,
    fieldsArgsValues,
    areArgumentsBound,
    backToFieldName,
    allArgumentsMode,
    types,
    haveArguments,
    createContentArgumentField,
    setNewArgumentValue,
    handleJumpIntoField,
    handleBackToPress,
    handleApplyPress,
    getLocalizedText,
    title = allArgumentsMode
                ? getLocalizedText('allArguments')
                : getLocalizedText('argumentsForField',
                  {
                    name: fields[0].name,
                  }),
    subtitle = getLocalizedText('pleaseFillAllRequiredArguments'),
    description = '',
    ) {
    const argsValues = clone(fieldsArgsValues).map(
            value => value || {},
        );
    return (
    {
      content: {
        title,
        subtitle,
        description,
        children: [
          fields.map((field, fieldNumber) =>
              haveArguments(field)
              ?
                <DataWindowContentGroup
                  title={field.name}
                >
                  <PropsList key={field.name}>
                    {
                           Object.keys(field.args).map(
                               argName =>
                                 <DataWindowQueryArgumentsFieldForm
                                   argField={field.args[argName]}
                                   argFieldName={argName}
                                   argFieldValue={
                                          argsValues[fieldNumber]
                                      }
                                   argumentsBound={
                                          areArgumentsBound[fieldNumber]
                                      }
                                   setNewArgumentValue={value =>
                                          setNewArgumentValue(
                                              argsValues[fieldNumber],
                                              value,
                                          )
                                      }
                                   types={types}
                                   key={argName}
                                 />,
                           )
                      }
                  </PropsList>
                </DataWindowContentGroup>
              : null,
          ),
        ],
      },
      buttons: [
        {
          text: getLocalizedText('backTo', { name: backToFieldName }),
          icon: 'chevron-left',
          onPress: handleBackToPress,
        },
        {
          text: getLocalizedText('apply'),
          onPress: () => handleApplyPress(argsValues),
        },
      ],
    }
    );
  }

    /**
     * @param {Object} field
     * @param {string} fieldName
     * @param {string} selectedFieldName
     * @param {string} propType
     * @param {Function<>:string} getFieldTypeName
     * @param {Function<>:string} getLocalizedText
     * @param {Function} handleFieldSelect
     * @param {Function} handleSetArgumentsClick
     * @param {Function} handleApplyClick
     * @param {Function} handleJumpIntoField
     * @return {Object}
     *
     */
  createContentField(
    field,
    fieldName,
    selectedFieldName,
    propType,
    getFieldTypeName,
    getLocalizedText,
    handleFieldSelect,
    handleSetArgumentsClick,
    handleApplyClick,
    handleJumpIntoField
    ) {
    return (
    {
      title: fieldName,
      type: getFieldTypeName(field),
      tooltip: field.description,
      actionType: 'select',
      clickable: true,
      argsButton: !!Object.keys(field.args).length,
      argsButtonText: getLocalizedText('setArguments'),
      chosen: fieldName === selectedFieldName,
      connection: canGoIntoField(propType, field),
      canBeApplied: canBeApplied(propType, field),
      applyButtonText: getLocalizedText('apply'),
      onSelect: () => handleFieldSelect(fieldName),
      onApplyClick: () => handleApplyClick(fieldName),
      onSetArgumentsClick: () => handleSetArgumentsClick(false),
      onJumpIntoClick: () => handleJumpIntoField(
                    fieldName,
                    field.type,
                    field.kind,
                    void 0,
                    false,
                ),
    }
    );
  }

    /**
     * @param {Object} type - Schema type
     * @param {Object} currentPathLast
     * @param {string} selectedFieldName
     * @param {string} propType
     * @param {boolean} hasArgs
     * @param {Array<Object>} breadcrumbs
     * @param {Function<Object>:string} getFieldTypeName
     * @param {Function} getLocalizedText
     * @param {Function} handleFieldSelect
     * @param {Function} handleSetArgumentsClick
     * @param {Function} handleApplyClick
     * @param {Function} handleJumpIntoField
     * @param {Function} createContentField
     * @param {Function} handleJumpToCurrentPathIndex
     * @return {Object}
     *
     */
  createContentType(
    type,
    currentPathLast,
    selectedFieldName,
    propType,
    hasArgs,
    breadcrumbs,
    getFieldTypeName,
    getLocalizedText,
    handleFieldSelect,
    handleSetArgumentsClick,
    handleApplyClick,
    handleJumpIntoField,
    createContentField,
    handleJumpToCurrentPathIndex,
    ) {
    return {
      breadcrumbs,
      onBreadcrumbsClick: handleJumpToCurrentPathIndex,
      content: {
        title:
          typeof currentPathLast.displayName === 'undefined'
          ? currentPathLast.name
          : getLocalizedText(currentPathLast.displayName),
        subtitle: getLocalizedText(
          'typeName',
          {
            name: currentPathLast.type,
            kind: getFieldTypeName(currentPathLast),
          },
        ),
        description: type.description,
        argsButton: hasArgs,
        argsButtonText: getLocalizedText('setArguments'),
        contentHeading: getLocalizedText('fields'),
        list: Object.keys(type.fields).reduce((acc, fieldName) => {
          const field = type.fields[fieldName];
          const connectionFields =
                        field.kind === FIELD_KINDS.CONNECTION
                        ? field.connectionFields
                        : {};

          if (
                        !showField(propType, field)
                    ) return acc;

          return acc.concat(
            [createContentField(
                field,
                fieldName,
                selectedFieldName,
                propType,
                getFieldTypeName,
                getLocalizedText,
                handleFieldSelect,
                handleSetArgumentsClick,
                handleApplyClick,
                handleJumpIntoField,
            )]).concat(
                Object.keys(connectionFields).filter(
                    connectionFieldName => {
                      const connectionField
                            = field
                                .connectionFields[
                                  connectionFieldName
                                ];
                      return showField(
                            propType,
                            connectionField,
                        );
                    },
                ).map(connectionFieldName =>
                    createContentField(
                        connectionFields[connectionFieldName],
                        `${fieldName}/${connectionFieldName}`,
                        selectedFieldName,
                        propType,
                        getFieldTypeName,
                        getLocalizedText,
                        handleFieldSelect,
                        handleSetArgumentsClick,
                        handleApplyClick,
                        handleJumpIntoField,
                    ),
                ),
            );
        }, []),
        onSetArgumentsClick:
                    () => handleSetArgumentsClick(true),
      },
      children: [],
    };
  }

    /**
     * @param {Array<Object>} path
     * @return {undefined|Object} - arguments for path's last node
     */
  _getBoundArgumentsByPath(path) {
    const queryArgsMap = this.props.currentComponentWithQueryArgs.queryArgs;
    const args = queryArgsMap.get('')
                &&
                queryArgsMap
                    .get('').get(path.map(({ name }) => name).join(' '));

    const formattedArgs = args ? args.toJS() : {};

    return args && Object.keys(formattedArgs).reduce((acc, key) =>
            Object.assign(
                acc, {
                  [key]:
                        DataWindowQueryLayout
                          .extractSourceDataValue(formattedArgs[key]),
                },
            )
        , {});
  }

    /**
     * @param {Array<Object>} fields - graphQLSchema fields
     * @return {Array<boolean>} - every element represents
     * arguments state for this field (bound or not)
     */
  _areArgumentsBound(fields) {
    const currentPath = this.currentSelectionPath.concat(
            !this.state.argumentsForCurrentPathLast
            && !this.state.allArgumentsMode
            ? [this._getSelectedField()]
            : [],
        );
    let currentPathIndex = -1;
    return fields.map(field => {
      while (
                ++currentPathIndex < currentPath.length
                &&
                !DataWindowQueryLayout.equalFieldPaths(
                    currentPath[currentPathIndex], field,
                )
            );
      return !!(DataWindowQueryLayout.equalFieldPaths(
                currentPath[currentPathIndex], field,
            ) && this._getBoundArgumentsByPath(
                currentPath.slice(
                    0, currentPathIndex + 1,
                ),
            ));
    });
  }

  get CONTENT_TYPE() {
    const currentEditingFields = this._getCurrentEditingFields();

    const linkTargetComponent =
            this.props.components.get(this.props.linkingPropOfComponentId);

    const linkTargetComponentMeta = getComponentMeta(
            linkTargetComponent.name,
            this.props.meta,
        );

    const linkTargetPropTypedef = getNestedTypedef(
            getPropTypedef(
                linkTargetComponentMeta,
                this.props.linkingPropName,
            ),
            this.props.linkingPropPath,
        );

    this.currentPropType = linkTargetPropTypedef;

    return (
            !this.state.argumentsMode
            ? this.createContentType(
                  this.props.schema.types[
                      this._getCurrentPathByIndex(-1).type
                  ],
                  this._getCurrentPathByIndex(-1),
                  this.state.selectedFieldName,
                  linkTargetPropTypedef,
                  DataWindowQueryLayout.haveArguments(currentEditingFields[0]),
                  this.breadcrumbs,
                  this._getFieldTypeName,
                  this.props.getLocalizedText,
                  this._handleFieldSelect,
                  this._handleSetArgumentsPress,
                  this._handleDataApplyPress,
                  this._handleJumpIntoField,
                  this.createContentField,
                  this._handleJumpToCurrentPathIndex,
              )
            : this.createContentArgumentsType(
                currentEditingFields,
                this._getCurrentArguments(
                    this.state.argumentsForCurrentPathLast,
                    this.state.allArgumentsMode,
                ),
                this._areArgumentsBound(
                    currentEditingFields,
                ),
                this._getCurrentPathByIndex(
                    isPrimitiveGraphQLType(
                        this._getCurrentPathByIndex(-1).type,
                      )
                  ? -2
                  : -1,
                ).name,
                this.state.allArgumentsMode,
                this.props.schema.types,
                DataWindowQueryLayout.haveArguments,
                this.createContentArgumentField,
                DataWindowQueryLayout.setNewArgumentValue,
                this._handleJumpIntoField,
                this._handleBackToPress,
                this._handleArgumentsApplyPress,
                this.props.getLocalizedText
            )
    );
  }
}

DataWindowQueryLayout.displayName = 'DataWindowQueryLayout';
