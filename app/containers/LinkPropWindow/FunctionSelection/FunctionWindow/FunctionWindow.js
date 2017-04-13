/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { List, Map } from 'immutable';
import { makeDefaultValue } from '@jssy/types';
import { Button } from '@reactackle/reactackle';
import ProjectFunctionRecord from '../../../../models/ProjectFunction';
import { jssyValueToImmutable } from '../../../../models/ProjectComponent';

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
import { buildDefaultValue } from '../../../../utils/meta';
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

/**
 *
 * @param {Object} arg - FunctionArgument Record
 * @return {JssyValueDefinition}
 */
const getValueDef = arg => ({
  ...arg.typedef,
  label: arg.name,
  description: arg.description,
  source: ['static'], // TODO: Compute sources list based on link target?
  sourceConfigs: {
    static: {
      default: makeDefaultValue(arg.typedef),
    },
  },
});

/**
 *
 * @param {Object} functionDef - ProjectFunction Record
 * @return {JssyValueDefinition[]}
 */
const getValueDefs = functionDef =>
  Array.from(functionDef.args.map(getValueDef));

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

export class FunctionWindow extends PureComponent {
  constructor(props) {
    super(props);
  
    this._argsValueDefs = getValueDefs(props.functionDef);

    this.state = {
      values: makeDefaultValues(this._argsValueDefs),
    };
    
    this._handleBreadcrumbsClick = this._handleBreadcrumbsClick.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleBackButtonPress = this._handleBackButtonPress.bind(this);
    this._handleApplyButtonPress = this._handleApplyButtonPress.bind(this);
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.functionDef !== this.props.functionDef) {
      this._argsValueDefs = getValueDefs(nextProps.functionDef);
      
      this.setState({
        values: makeDefaultValues(this._argsValueDefs),
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
    
    const props = functionDef.args.map((arg, idx) => {
      const valueDef = this._argsValueDefs[idx];
      
      return (
        <JssyValueEditor
          key={String(idx)}
          name={String(idx)}
          value={values.get(idx)}
          valueDef={valueDef}
          optional={!arg.isRequired}
          getLocalizedText={getLocalizedText}
          onChange={this._handleChange}
          onLink={onLink}
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
