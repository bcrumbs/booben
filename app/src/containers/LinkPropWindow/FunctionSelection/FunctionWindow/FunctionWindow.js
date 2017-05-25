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
import { buildDefaultValue } from '../../../../lib/meta';
import { noop, returnArg } from '../../../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  targetValueDef: PropTypes.object.isRequired,
  functionDef: PropTypes.instanceOf(ProjectFunctionRecord).isRequired,
  getLocalizedText: PropTypes.func,
  onApply: PropTypes.func,
  onReturn: PropTypes.func,
  onReturnToList: PropTypes.func,
  onNestedLink: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
  onApply: noop,
  onReturn: noop,
  onReturnToList: noop,
  onNestedLink: noop,
};

/**
 *
 * @param {Object} arg - FunctionArgument Record
 * @param {JssyValueDefinition} targetValueDef
 * @return {JssyValueDefinition}
 */
const getValueDef = (arg, targetValueDef) => {
  const ret = {
    ...arg.typedef,
    label: arg.name,
    description: arg.description,
    source: [],
    sourceConfigs: {},
  };

  targetValueDef.source.forEach(source => {
    ret.source.push(source);
    ret.sourceConfigs[source] = {};

    if (source === 'static') {
      ret.sourceConfigs.static.default = makeDefaultValue(arg.typedef);
    }
  });

  return ret;
};

/**
 *
 * @param {Object} functionDef - ProjectFunction Record
 * @param {JssyValueDefinition} targetValueDef
 * @return {JssyValueDefinition[]}
 */
const getValueDefs = (functionDef, targetValueDef) =>
  Array.from(functionDef.args.map(arg => getValueDef(arg, targetValueDef)));

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
  constructor(props, context) {
    super(props, context);
  
    this._argsValueDefs = getValueDefs(props.functionDef, props.targetValueDef);

    this.state = {
      values: makeDefaultValues(this._argsValueDefs),
      linking: false,
      linkingName: '',
      linkingPath: null,
    };
    
    this._handleBreadcrumbsClick = this._handleBreadcrumbsClick.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleLink = this._handleLink.bind(this);
    this._handleLinkDone = this._handleLinkDone.bind(this);
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
  
  _handleLink({ name, path, targetValueDef, targetUserTypedefs }) {
    const { functionDef, onNestedLink } = this.props;

    const argIndex = parseInt(name, 10);
    const arg = functionDef.args.get(argIndex);
    const nestedLinkWindowName =
      `${functionDef.title}(${[arg.name, ...path].join('.')})`;
    
    this.setState({
      linking: true,
      linkingName: name,
      linkingPath: path,
    });
    
    onNestedLink({
      name: nestedLinkWindowName,
      valueDef: targetValueDef,
      userTypedefs: targetUserTypedefs,
      onLink: this._handleLinkDone,
    });
  }
  
  _handleLinkDone({ newValue }) {
    const { values, linking, linkingName, linkingPath } = this.state;
    
    if (!linking) return;
  
    const argIndex = parseInt(linkingName, 10);
    
    if (linkingPath.length > 0) {
      this.setState({
        values: values.update(
          argIndex,
          oldValue => oldValue.setInStatic(linkingPath, newValue),
        ),
      });
    } else {
      this.setState({
        values: values.set(argIndex, newValue),
      });
    }
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
          getLocalizedText={getLocalizedText}
          onChange={this._handleChange}
          onLink={this._handleLink}
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
              text={getLocalizedText('linkDialog.function.backToList')}
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
