/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';
import { Button } from '@reactackle/reactackle';

import {
  BlockContent,
  BlockContentNavigation,
  BlockBreadcrumbs,
  BlockContentBox,
  BlockContentBoxGroup,
  BlockContentBoxItem,
  BlockContentActions,
  BlockContentActionsRegion,
} from '@jssy/common-ui';

import ProjectFunctionRecord from '../../../../models/ProjectFunction';
import JssyValue, { SourceDataState } from '../../../../models/JssyValue';
import { jssyValueToImmutable } from '../../../../models/ProjectComponent';

import {
  getLocalizedTextFromState,
  currentComponentsSelector,
} from '../../../../selectors';

import { pickComponentData } from '../../../../actions/project';

import {
  getStateSlotPickerFns,
} from '../../../../actions/helpers/component-picker';

import { DataWindowTitle } from '../../../../components/DataWindow/DataWindow';
import { PropsList } from '../../../../components/PropsList/PropsList';
import { JssyValueEditor } from '../../../JssyValueEditor/JssyValueEditor';
import { buildDefaultValue } from '../../../../lib/meta';
import { noop, returnArg, mapListToArray } from '../../../../utils/misc';
import * as JssyPropTypes from '../../../../constants/common-prop-types';

const propTypes = {
  meta: PropTypes.object.isRequired,
  currentComponents: JssyPropTypes.components.isRequired,
  pickingComponentData: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  pickedComponentId: PropTypes.number.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  pickedComponentData: PropTypes.string,
  targetValueDef: PropTypes.object.isRequired,
  functionDef: PropTypes.instanceOf(ProjectFunctionRecord).isRequired,
  language: PropTypes.string.isRequired,
  getLocalizedText: PropTypes.func,
  onApply: PropTypes.func,
  onReturn: PropTypes.func,
  onReturnToList: PropTypes.func,
  onPickComponentData: PropTypes.func.isRequired,
};

const defaultProps = {
  pickedComponentData: null,
  getLocalizedText: returnArg,
  onApply: noop,
  onReturn: noop,
  onReturnToList: noop,
};

const mapStateToProps = state => ({
  meta: state.project.meta,
  currentComponents: currentComponentsSelector(state),
  pickingComponentData: state.project.pickingComponentData,
  pickedComponentId: state.project.pickedComponentId,
  pickedComponentData: state.project.pickedComponentData,
  language: state.app.language,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onPickComponentData: (filter, dataGetter) =>
    void dispatch(pickComponentData(filter, dataGetter)),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

/**
 *
 * @param {Object} arg - FunctionArgument Record
 * @param {JssyValueDefinition} targetValueDef
 * @return {JssyValueDefinition}
 */
const getValueDef = (arg, targetValueDef) => ({
  ...arg.typedef,
  label: arg.name,
  description: arg.description,
  source: [...targetValueDef.source],
});

/**
 *
 * @param {Object} functionDef - ProjectFunction Record
 * @param {JssyValueDefinition} targetValueDef
 * @return {JssyValueDefinition[]}
 */
const getValueDefs = (functionDef, targetValueDef) =>
  mapListToArray(functionDef.args, arg => getValueDef(arg, targetValueDef));

/**
 *
 * @param {JssyValueDefinition[]} argValueDefs
 * @return {Immutable.List<Object>} - List of JssyValues
 */
const makeDefaultValues = argValueDefs => List(argValueDefs.map(
  valueDef => jssyValueToImmutable(buildDefaultValue(valueDef)),
));

/**
 *
 * @param {Immutable.List<Object>} values - List of JssyValues
 * @param {Object} functionDef - ProjectFunction Record
 * @return {Immutable.Map<string, Object>} - Map of string -> JssyValue
 */
const argValuesToMap = (values, functionDef) =>
  Map().withMutations(map => {
    values.forEach((value, idx) => {
      map.set(functionDef.args.get(idx).name, value);
    });
  });

class FunctionWindowComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);
  
    this._argsValueDefs = getValueDefs(props.functionDef, props.targetValueDef);

    this.state = {
      values: makeDefaultValues(this._argsValueDefs),
      linking: false,
      linkingName: '',
      linkingPath: null,
      picking: false,
      pickingName: '',
      pickingPath: null,
    };
    
    this._handleBreadcrumbsClick = this._handleBreadcrumbsClick.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handlePick = this._handlePick.bind(this);
    this._handleBackButtonPress = this._handleBackButtonPress.bind(this);
    this._handleApplyButtonPress = this._handleApplyButtonPress.bind(this);
  }
  
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.functionDef !== this.props.functionDef ||
      nextProps.targetValueDef !== this.props.targetValueDef
    ) {
      this._argsValueDefs = getValueDefs(
        nextProps.functionDef,
        nextProps.targetValueDef,
      );
      
      this.setState({
        values: makeDefaultValues(this._argsValueDefs),
      });
    }
    
    if (
      this.props.pickingComponentData &&
      !nextProps.pickingComponentData
    ) {
      this._handlePickDone({
        componentId: nextProps.pickedComponentId,
        stateSlot: nextProps.pickedComponentData,
      });
    }
  }
  
  _handleBreadcrumbsClick({ index }) {
    const { onReturn, onReturnToList } = this.props;
    
    if (index === 0) onReturn();
    else if (index === 1) onReturnToList();
  }
  
  _handleChange({ name, value }) {
    const { values } = this.state;
    
    const argIndex = parseInt(name, 10);
    
    this.setState({
      values: values.set(argIndex, value),
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
  
  _handlePick({ name, path, targetValueDef, targetUserTypedefs }) {
    const {
      meta,
      currentComponents,
      language,
      onPickComponentData,
    } = this.props;

    const { filter, dataGetter } = getStateSlotPickerFns(
      targetValueDef,
      targetUserTypedefs,
      currentComponents,
      meta,
      language,
    );
    
    this.setState({
      picking: true,
      pickingName: name,
      pickingPath: path,
    });
  
    onPickComponentData(filter, dataGetter);
  }
  
  _handlePickDone({ componentId, stateSlot }) {
    const { values, picking, pickingName, pickingPath } = this.state;
  
    if (!picking) return;
  
    const argIndex = parseInt(pickingName, 10);
    const newValue = new JssyValue({
      source: 'state',
      sourceData: new SourceDataState({
        componentId,
        stateSlot,
      }),
    });
    
    this.setState({
      picking: false,
      pickingName: '',
      pickingPath: [],
      values: pickingPath.length > 0
        ? values.update(
          argIndex,
          oldValue => oldValue.setInStatic(pickingPath, newValue),
        )
        : values.set(argIndex, newValue),
    });
  }

  _getBreadcrumbsItems() {
    const { functionDef, getLocalizedText } = this.props;

    return [{
      title: getLocalizedText('linkDialog.sources'),
    }, {
      title: getLocalizedText('linkDialog.source.function'),
    }, {
      title: functionDef.title,
    }];
  }
  
  _renderArgsForm() {
    const { functionDef, getLocalizedText } = this.props;
    const { values } = this.state;
    
    const props = functionDef.args.map((arg, idx) => {
      const valueDef = this._argsValueDefs[idx];
      
      return (
        <JssyValueEditor
          key={String(idx)}
          name={String(idx)}
          value={values.get(idx)}
          valueDef={valueDef}
          optional={!arg.isRequired}
          onlyStatic
          getLocalizedText={getLocalizedText}
          onChange={this._handleChange}
          onPick={this._handlePick}
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
          <BlockContentBoxGroup shading="dim">
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
              text={getLocalizedText('linkDialog.function.backToList')}
              onPress={this._handleBackButtonPress}
            />
          </BlockContentActionsRegion>
        </BlockContentActions>
      </BlockContent>
    );
  }
}

FunctionWindowComponent.propTypes = propTypes;
FunctionWindowComponent.defaultProps = defaultProps;
FunctionWindowComponent.displayName = 'FunctionWindow';

export const FunctionWindow = wrap(FunctionWindowComponent);
