/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { Map } from 'immutable';
import { makeDefaultValue, getNestedTypedef, TypeNames } from '@jssy/types';
import { Button } from '@reactackle/reactackle';
import ProjectFunctionRecord from '../../../../models/ProjectFunction';
import JssyValue from '../../../../models/JssyValue';

import {
  BlockContent,
  BlockContentNavigation,
  BlockBreadcrumbs,
  BlockContentBox,
  BlockContentBoxGroup,
  BlockContentBoxItem,
  BlockContentActions,
  BlockContentActionsRegion,
} from '../../../../components/BlockContent/BlockContent';

import { DataWindowTitle } from '../../../../components/DataWindow/DataWindow';

import {
  PropsList,
  Prop,
  jssyValueToPropValue,
  jssyTypedefToPropType,
} from '../../../../components/PropsList/PropsList';

import { noop, returnArg } from '../../../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  functionDef: PropTypes.instanceOf(ProjectFunctionRecord).isRequired,
  getLocalizedText: PropTypes.func,
  onApply: PropTypes.func,
  onReturn: PropTypes.func,
  onReturnToList: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
  onApply: noop,
  onReturn: noop,
  onReturnToList: noop,
};

const makeDefaultValueForArg = arg =>
  JssyValue.staticFromJS(makeDefaultValue(arg.typedef));

const makeDefaultValuesForArgs = functionDef =>
  functionDef.args.map(arg =>
    arg.isRequired ? makeDefaultValueForArg(arg) : null);

/**
 *
 * @param {number} index
 * @return {string}
 */
const formatArrayItemLabel = index => `Item ${index}`; // TODO: Get string from i18n

/**
 *
 * @param {Immutable.List<JssyValue>} argValues
 * @param {Object} functionDef
 * @return {Immutable.Map<string, JssyValue>}
 */
const argValuesToMap = (argValues, functionDef) =>
  Map().withMutations(map => {
    argValues.forEach((value, idx) => {
      map.set(functionDef.args.get(idx).name, value);
    });
  });

export class FunctionWindow extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      values: makeDefaultValuesForArgs(props.functionDef),
    };
    
    this._handleBreadcrumbsClick = this._handleBreadcrumbsClick.bind(this);
    this._handleCheck = this._handleCheck.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleAddValue = this._handleAddValue.bind(this);
    this._handleDeleteValue = this._handleDeleteValue.bind(this);
    this._handleBackButtonPress = this._handleBackButtonPress.bind(this);
    this._handleApplyButtonPress = this._handleApplyButtonPress.bind(this);
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.functionDef !== this.props.functionDef) {
      this.setState({
        values: makeDefaultValuesForArgs(nextProps.functionDef),
      });
    }
  }
  
  _getBreadcrumbsItems() {
    const { functionDef, getLocalizedText } = this.props;
    
    return [{
      title: getLocalizedText('sources'),
    }, {
      title: getLocalizedText('functions'),
    }, {
      title: functionDef.title,
    }];
  }
  
  _getPropTypeForArg(arg) {
    const getNestedExtra = (_, __, ___, fieldName) =>
      ({ arg: null, fieldName });
    
    const applyExtra = (propType, { arg, fieldName }, jssyTypedef) => {
      propType.label = arg ? arg.name : fieldName;
      propType.secondaryLabel = jssyTypedef.type;
      propType.tooltip = arg.description;
      propType.checkable = arg ? !arg.isRequired : jssyTypedef.notNull;
      propType.required = arg ? arg.isRequired : false;
    
      if (jssyTypedef.type === TypeNames.ARRAY_OF)
        propType.formatItemLabel = formatArrayItemLabel;
    
      return propType;
    };
  
    return jssyTypedefToPropType(
      arg.typedef,
      { arg, fieldName: '' },
      getNestedExtra,
      applyExtra,
    );
  }
  
  _getValueForArg(arg, argIndex) {
    const { values } = this.state;
    
    const jssyValue = values.get(argIndex);
    if (!jssyValue) return { value: null, checked: false };
    
    const ret = jssyValueToPropValue(jssyValue, arg.typedef);
    ret.checked = true;
    return ret;
  }
  
  _handleBreadcrumbsClick(itemIndex) {
    const { onReturn, onReturnToList } = this.props;
    
    if (itemIndex === 0) onReturn();
    else if (itemIndex === 1) onReturnToList();
  }
  
  _handleCheck({ propName, path, checked }) {
    const { functionDef } = this.props;
    const { values } = this.state;
    
    const argIndex = parseInt(propName, 10);
    const arg = functionDef.args.get(argIndex);
    
    if (path.length === 0) {
      this.setState({
        values: values.set(
          argIndex,
          checked ? makeDefaultValueForArg(arg) : null,
        ),
      });
    } else {
      const newValue = checked
        ? makeDefaultValue(getNestedTypedef(arg.typedef, path))
        : null;
      
      this.setState({
        values: values.update(
          argIndex,
          argValue => argValue.replaceStaticValueIn(path, newValue),
        ),
      });
    }
  }
  
  _handleChange({ propName, path, value }) {
    const { values } = this.state;
    
    const argIndex = parseInt(propName, 10);
    
    this.setState({
      values: values.update(
        argIndex,
        argValue => argValue.replaceStaticValueIn(path, value),
      ),
    });
  }
  
  _handleAddValue({ propName, where, index }) {
    const { functionDef } = this.props;
    const { values } = this.state;
    
    const argIndex = parseInt(propName, 10);
    const arg = functionDef.args.get(argIndex);
    const newValue =
      makeDefaultValue(getNestedTypedef(arg.typedef, [...where, index]));
    
    this.setState({
      values: values.update(
        argIndex,
        argValue => argValue.addJSValueInStatic(where, index, newValue),
      ),
    });
  }
  
  _handleDeleteValue({ propName, where, index }) {
    const { values } = this.state;
    
    const argIndex = parseInt(propName, 10);
    
    this.setState({
      values: values.update(
        argIndex,
        argValue => argValue.deleteValueInStatic(where, index),
      ),
    });
  }
  
  _handleBackButtonPress() {
    this.props.onReturnToList();
  }
  
  _handleApplyButtonPress() {
    const { functionDef } = this.props;
    const { values } = this.state;
    
    const valuesMap = argValuesToMap(values, functionDef);
    this.props.onApply({ argValues: valuesMap });
  }
  
  _renderArgsForm() {
    const { functionDef } = this.props;
    
    const props = functionDef.args.map((arg, idx) => {
      const propType = this._getPropTypeForArg(arg);
      const value = this._getValueForArg(arg, idx);
      
      return (
        <Prop
          key={String(idx)}
          propName={String(idx)}
          propType={propType}
          value={value}
          onCheck={this._handleCheck}
          onChange={this._handleChange}
          onAddValue={this._handleAddValue}
          onDeleteValue={this._handleDeleteValue}
        />
      );
    });
    
    return (
      <PropsList>
        {props}
      </PropsList>
    );
  }

  render() {
    const { functionDef, getLocalizedText } = this.props;
    
    const breadcrumbsItems = this._getBreadcrumbsItems();
    const argsForm = this._renderArgsForm();
    
    return (
      <BlockContent>
        <BlockContentNavigation isBordered>
          <BlockBreadcrumbs
            items={breadcrumbsItems}
            mode="dark"
            onItemClick={this._handleBreadcrumbsClick}
          />
        </BlockContentNavigation>
  
        <BlockContentBox isBordered>
          <BlockContentBoxGroup dim>
            <BlockContentBoxItem>
              <DataWindowTitle
                title={functionDef.title}
                subtitle={functionDef.description}
              />
            </BlockContentBoxItem>
          </BlockContentBoxGroup>
          
          <BlockContentBoxItem>
            {argsForm}
          </BlockContentBoxItem>
        </BlockContentBox>
  
        <BlockContentActions>
          <BlockContentActionsRegion type="main">
            <Button
              text={getLocalizedText('common.apply')}
              onPress={this._handleApplyButtonPress}
            />
          </BlockContentActionsRegion>
  
          <BlockContentActionsRegion type="secondary">
            <Button
              text={getLocalizedText('functions.backToList')}
              onPress={this._handleBackButtonPress}
            />
          </BlockContentActionsRegion>
        </BlockContentActions>
      </BlockContent>
    );
  }
}

FunctionWindow.propTypes = propTypes;
FunctionWindow.defaultProps = defaultProps;
FunctionWindow.displayName = 'FunctionWindow';
