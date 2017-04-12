/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { Map } from 'immutable';
import { makeDefaultValue } from '@jssy/types';
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
import { PropsList } from '../../../../components/PropsList/PropsList';
import { JssyValueEditor } from '../../../JssyValueEditor/JssyValueEditor';
import { noop, returnArg } from '../../../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  functionDef: PropTypes.instanceOf(ProjectFunctionRecord).isRequired,
  getLocalizedText: PropTypes.func,
  onLink: PropTypes.func,
  onApply: PropTypes.func,
  onReturn: PropTypes.func,
  onReturnToList: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
  onLink: noop,
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
    this._handleChange = this._handleChange.bind(this);
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
  
  _renderArgsForm() {
    const { functionDef, getLocalizedText, onLink } = this.props;
    const { values } = this.state;
    
    const props = functionDef.args.map((arg, idx) => (
      <JssyValueEditor
        key={String(idx)}
        name={String(idx)}
        value={values.get(idx) || null}
        valueDef={arg.typedef}
        optional={!arg.isRequired}
        label={arg.name}
        description={arg.description}
        getLocalizedText={getLocalizedText}
        onChange={this._handleChange}
        onLink={onLink}
      />
    ));
    
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
          <BlockContentBoxGroup colorScheme="dim">
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
